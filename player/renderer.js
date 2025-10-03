const { ipcRenderer } = require('electron');

class DigitalSignagePlayer {
    constructor() {
        this.currentPlaylist = [];
        this.currentContentIndex = 0;
        this.isPlaying = false;
        this.playbackInterval = null;
        this.heartbeatInterval = null;
        this.connectionStatus = 'disconnected';
        this.deviceInfo = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startHeartbeat();
    }
    
    initializeElements() {
        // Setup screen elements
        this.setupScreen = document.getElementById('setupScreen');
        this.deviceCodeInput = document.getElementById('deviceCode');
        this.connectBtn = document.getElementById('connectBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.statusMessage = document.getElementById('statusMessage');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Playback screen elements
        this.playbackScreen = document.getElementById('playbackScreen');
        this.playlistInfo = document.getElementById('playlistInfo');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.connectionText = document.getElementById('connectionText');
        this.contentDisplay = document.getElementById('contentDisplay');
        
        // Error screen elements
        this.errorScreen = document.getElementById('errorScreen');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryErrorBtn = document.getElementById('retryErrorBtn');
    }
    
    setupEventListeners() {
        // Setup screen events
        this.connectBtn.addEventListener('click', () => this.handleConnect());
        this.retryBtn.addEventListener('click', () => this.handleRetry());
        this.deviceCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleConnect();
            }
        });
        
        // Error screen events
        this.retryErrorBtn.addEventListener('click', () => this.handleRetry());
        
        // IPC event listeners
        ipcRenderer.on('playlist-update', (event, payload) => {
            this.handlePlaylistUpdate(payload);
        });
        
        ipcRenderer.on('force-stop-playback', () => {
            this.handleForceStop();
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // Handle visibility change (when app is minimized/restored)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pausePlayback();
            } else {
                this.resumePlayback();
            }
        });
    }
    
    async handleConnect() {
        const deviceCode = this.deviceCodeInput.value.trim().toUpperCase();
        
        if (!deviceCode || deviceCode.length !== 6) {
            this.showStatus('Please enter a valid 6-character device code', 'error');
            return;
        }
        
        this.showLoading(true);
        this.showStatus('Connecting to server...', 'pending');
        
        try {
            const result = await ipcRenderer.invoke('submit-device-code', deviceCode);
            
            if (result.success) {
                this.deviceInfo = result.device;
                this.showStatus('Device connected successfully!', 'active');
                
                // Wait a moment then switch to playback screen
                setTimeout(() => {
                    this.switchToPlaybackScreen();
                    this.subscribeToPlaylist();
                }, 1500);
            } else {
                this.showStatus(result.error || 'Connection failed', 'error');
                this.showRetryButton(true);
            }
        } catch (error) {
            console.error('Connection error:', error);
            this.showStatus('Connection failed. Please check your internet connection.', 'error');
            this.showRetryButton(true);
        } finally {
            this.showLoading(false);
        }
    }
    
    async handleRetry() {
        this.showRetryButton(false);
        this.showStatus('', '');
        this.deviceCodeInput.value = '';
        this.deviceCodeInput.focus();
    }
    
    async subscribeToPlaylist() {
        try {
            const result = await ipcRenderer.invoke('subscribe-to-playlist');
            
            if (result.success) {
                this.currentPlaylist = result.playlists;
                this.updateConnectionStatus('connected');
                this.startPlayback();
            } else {
                console.error('Playlist subscription failed:', result.error);
                this.updateConnectionStatus('disconnected');
                this.showError('Failed to load playlist: ' + result.error);
            }
        } catch (error) {
            console.error('Playlist subscription error:', error);
            this.updateConnectionStatus('disconnected');
            this.showError('Failed to subscribe to playlist');
        }
    }
    
    handlePlaylistUpdate(payload) {
        console.log('Playlist update received:', payload);
        
        // Refresh the playlist data
        this.subscribeToPlaylist();
    }
    
    handleForceStop() {
        console.log('Force stop command received');
        this.stopPlayback();
        this.showStatus('Playback stopped by administrator', 'error');
    }
    
    startPlayback() {
        if (this.currentPlaylist.length === 0) {
            this.showNoContent();
            return;
        }
        
        this.isPlaying = true;
        this.currentContentIndex = 0;
        this.playNextContent();
    }
    
    playNextContent() {
        if (!this.isPlaying || this.currentPlaylist.length === 0) {
            return;
        }
        
        const currentItem = this.currentPlaylist[this.currentContentIndex];
        if (!currentItem || !currentItem.content) {
            this.currentContentIndex = (this.currentContentIndex + 1) % this.currentPlaylist.length;
            this.playNextContent();
            return;
        }
        
        this.displayContent(currentItem);
        this.updatePlaylistInfo(currentItem);
        
        // Calculate duration for this content
        const duration = this.calculateContentDuration(currentItem);
        
        // Schedule next content
        this.playbackInterval = setTimeout(() => {
            this.currentContentIndex = (this.currentContentIndex + 1) % this.currentPlaylist.length;
            this.playNextContent();
        }, duration);
    }
    
    displayContent(playlistItem) {
        const content = playlistItem.content;
        const contentElement = this.createContentElement(content);
        
        // Fade out current content
        if (this.contentDisplay.children.length > 0) {
            this.contentDisplay.firstChild.classList.add('fade-out');
        }
        
        // Clear display and add new content
        setTimeout(() => {
            this.contentDisplay.innerHTML = '';
            this.contentDisplay.appendChild(contentElement);
            contentElement.classList.add('fade-in');
        }, 500);
    }
    
    createContentElement(content) {
        const container = document.createElement('div');
        container.className = 'content-item';
        
        if (content.content_type === 'image') {
            const img = document.createElement('img');
            img.src = content.file_url;
            img.alt = content.file_name;
            img.onerror = () => {
                console.error('Failed to load image:', content.file_url);
                this.showError('Failed to load image: ' + content.file_name);
            };
            container.appendChild(img);
        } else if (content.content_type === 'video') {
            const video = document.createElement('video');
            video.src = content.file_url;
            video.autoplay = true;
            video.loop = false;
            video.muted = true; // Mute by default for digital signage
            video.onerror = () => {
                console.error('Failed to load video:', content.file_url);
                this.showError('Failed to load video: ' + content.file_name);
            };
            video.onended = () => {
                // Video ended, move to next content
                this.currentContentIndex = (this.currentContentIndex + 1) % this.currentPlaylist.length;
                this.playNextContent();
            };
            container.appendChild(video);
        }
        
        return container;
    }
    
    calculateContentDuration(playlistItem) {
        const startTime = new Date(playlistItem.start_time);
        const endTime = new Date(playlistItem.end_time);
        const now = new Date();
        
        // If we're outside the scheduled time, use a default duration
        if (now < startTime || now > endTime) {
            return playlistItem.content.content_type === 'video' ? 30000 : 10000; // 30s for video, 10s for image
        }
        
        // Calculate remaining time in the scheduled window
        const remainingTime = endTime.getTime() - now.getTime();
        return Math.max(remainingTime, 5000); // Minimum 5 seconds
    }
    
    updatePlaylistInfo(playlistItem) {
        const content = playlistItem.content;
        const startTime = new Date(playlistItem.start_time).toLocaleString();
        const endTime = new Date(playlistItem.end_time).toLocaleString();
        
        this.playlistInfo.innerHTML = `
            <div><strong>${content.file_name}</strong></div>
            <div>${playlistItem.content.content_type.toUpperCase()}</div>
            <div>Schedule: ${startTime} - ${endTime}</div>
            <div>Item ${this.currentContentIndex + 1} of ${this.currentPlaylist.length}</div>
        `;
    }
    
    showNoContent() {
        this.contentDisplay.innerHTML = `
            <div style="text-align: center; color: #9ca3af;">
                <h2>No Content Scheduled</h2>
                <p>Waiting for content to be added to your playlist...</p>
            </div>
        `;
        
        this.playlistInfo.innerHTML = 'No content scheduled';
    }
    
    stopPlayback() {
        this.isPlaying = false;
        
        if (this.playbackInterval) {
            clearTimeout(this.playbackInterval);
            this.playbackInterval = null;
        }
        
        // Stop any playing videos
        const videos = this.contentDisplay.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }
    
    pausePlayback() {
        if (this.playbackInterval) {
            clearTimeout(this.playbackInterval);
            this.playbackInterval = null;
        }
        
        const videos = this.contentDisplay.querySelectorAll('video');
        videos.forEach(video => video.pause());
    }
    
    resumePlayback() {
        if (this.isPlaying) {
            this.playNextContent();
        }
    }
    
    switchToPlaybackScreen() {
        this.setupScreen.classList.add('hidden');
        this.playbackScreen.classList.add('active');
        this.playbackScreen.classList.remove('hidden');
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.playbackScreen.classList.add('hidden');
        this.errorScreen.classList.remove('hidden');
    }
    
    updateConnectionStatus(status) {
        this.connectionStatus = status;
        const statusElement = document.getElementById('connectionStatus');
        const textElement = document.getElementById('connectionText');
        
        statusElement.className = `connection-status ${status}`;
        
        if (status === 'connected') {
            textElement.textContent = 'Connected';
        } else {
            textElement.textContent = 'Disconnected';
        }
    }
    
    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status status-${type}`;
        this.statusMessage.classList.remove('hidden');
    }
    
    showLoading(show) {
        if (show) {
            this.loadingIndicator.classList.remove('hidden');
            this.connectBtn.disabled = true;
        } else {
            this.loadingIndicator.classList.add('hidden');
            this.connectBtn.disabled = false;
        }
    }
    
    showRetryButton(show) {
        if (show) {
            this.retryBtn.classList.remove('hidden');
            this.connectBtn.classList.add('hidden');
        } else {
            this.retryBtn.classList.add('hidden');
            this.connectBtn.classList.remove('hidden');
        }
    }
    
    startHeartbeat() {
        // Send heartbeat every 30 seconds
        this.heartbeatInterval = setInterval(async () => {
            try {
                await ipcRenderer.invoke('update-heartbeat');
            } catch (error) {
                console.error('Heartbeat error:', error);
            }
        }, 30000);
    }
    
    cleanup() {
        this.stopPlayback();
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}

// Initialize the player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.player = new DigitalSignagePlayer();
});

// Handle uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    ipcRenderer.invoke('report-error', {
        message: event.error.message,
        stack: event.error.stack,
        timestamp: new Date().toISOString()
    });
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    ipcRenderer.invoke('report-error', {
        message: event.reason.message || event.reason,
        stack: event.reason.stack,
        timestamp: new Date().toISOString()
    });
});