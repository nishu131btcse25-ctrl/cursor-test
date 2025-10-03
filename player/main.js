const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'your_supabase_project_url_here',
  process.env.SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'
);

let mainWindow;
let deviceId = null;
let deviceCode = null;
let isConnected = false;

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    fullscreen: true, // Start in fullscreen for digital signage
    show: false, // Don't show until ready
    titleBarStyle: 'hidden',
    autoHideMenuBar: true
  });

  // Load the HTML file
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus the window
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation away from the app
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });

  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for communication with renderer process

// Handle device code submission
ipcMain.handle('submit-device-code', async (event, code) => {
  try {
    console.log('Submitting device code:', code);
    
    // Look up device by unique code
    const { data: device, error } = await supabase
      .from('devices')
      .select('*')
      .eq('unique_code', code.toUpperCase())
      .single();

    if (error || !device) {
      return { success: false, error: 'Invalid device code' };
    }

    if (device.status === 'active') {
      return { success: false, error: 'Device is already active' };
    }

    // Update device status to active
    const { error: updateError } = await supabase
      .from('devices')
      .update({ 
        status: 'active',
        last_seen: new Date().toISOString()
      })
      .eq('device_id', device.device_id);

    if (updateError) {
      console.error('Error updating device status:', updateError);
      return { success: false, error: 'Failed to activate device' };
    }

    // Store device info
    deviceId = device.device_id;
    deviceCode = code;
    isConnected = true;

    console.log('Device activated successfully:', deviceId);
    return { 
      success: true, 
      device: {
        id: device.device_id,
        name: device.device_name,
        code: device.unique_code
      }
    };
  } catch (error) {
    console.error('Error in submit-device-code:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
});

// Handle playlist subscription
ipcMain.handle('subscribe-to-playlist', async (event) => {
  if (!deviceId) {
    return { success: false, error: 'No device connected' };
  }

  try {
    console.log('Subscribing to playlist for device:', deviceId);
    
    // Get initial playlist data
    const { data: playlists, error } = await supabase
      .from('playlists')
      .select(`
        *,
        content:content_id(*)
      `)
      .eq('device_id', deviceId)
      .eq('status', 'active')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching playlists:', error);
      return { success: false, error: 'Failed to fetch playlist' };
    }

    // Set up real-time subscription
    const subscription = supabase
      .channel('playlist-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'playlists',
        filter: `device_id=eq.${deviceId}`
      }, (payload) => {
        console.log('Playlist change received:', payload);
        
        // Send update to renderer process
        mainWindow.webContents.send('playlist-update', payload);
      })
      .subscribe();

    return { 
      success: true, 
      playlists: playlists || [],
      subscription: subscription
    };
  } catch (error) {
    console.error('Error in subscribe-to-playlist:', error);
    return { success: false, error: 'Failed to subscribe to playlist' };
  }
});

// Handle content download
ipcMain.handle('download-content', async (event, contentUrl, contentType) => {
  try {
    console.log('Downloading content:', contentUrl);
    
    // For now, just return the URL
    // In a production app, you might want to cache the content locally
    return { 
      success: true, 
      url: contentUrl,
      type: contentType
    };
  } catch (error) {
    console.error('Error downloading content:', error);
    return { success: false, error: 'Failed to download content' };
  }
});

// Handle force stop command
ipcMain.handle('handle-force-stop', async (event) => {
  try {
    console.log('Handling force stop command');
    
    // Send force stop signal to renderer
    mainWindow.webContents.send('force-stop-playback');
    
    return { success: true };
  } catch (error) {
    console.error('Error handling force stop:', error);
    return { success: false, error: 'Failed to handle force stop' };
  }
});

// Handle device heartbeat
ipcMain.handle('update-heartbeat', async (event) => {
  if (!deviceId) {
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('devices')
      .update({ last_seen: new Date().toISOString() })
      .eq('device_id', deviceId);

    if (error) {
      console.error('Error updating heartbeat:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in update-heartbeat:', error);
    return { success: false };
  }
});

// Handle app info request
ipcMain.handle('get-app-info', async (event) => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    deviceId: deviceId,
    deviceCode: deviceCode,
    isConnected: isConnected
  };
});

// Handle error reporting
ipcMain.handle('report-error', async (event, errorInfo) => {
  console.error('Renderer error reported:', errorInfo);
  
  // In a production app, you might want to send this to an error reporting service
  return { success: true };
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  
  if (deviceId) {
    // Update device status to offline
    supabase
      .from('devices')
      .update({ status: 'offline' })
      .eq('device_id', deviceId)
      .then(() => {
        console.log('Device marked as offline');
        app.quit();
      })
      .catch((error) => {
        console.error('Error marking device offline:', error);
        app.quit();
      });
  } else {
    app.quit();
  }
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  if (deviceId) {
    supabase
      .from('devices')
      .update({ status: 'offline' })
      .eq('device_id', deviceId)
      .then(() => {
        console.log('Device marked as offline');
        app.quit();
      })
      .catch((error) => {
        console.error('Error marking device offline:', error);
        app.quit();
      });
  } else {
    app.quit();
  }
});