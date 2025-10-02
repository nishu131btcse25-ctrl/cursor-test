// Global variables
let posts = [];
let events = [];
let stateBoards = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize modals
    initializeModals();
    
    // Initialize posts functionality
    initializePosts();
    
    // Initialize events functionality if on events page
    if (document.getElementById('eventsGrid')) {
        initializeEvents();
    }
    
    // Initialize contact search if on contact page
    if (document.getElementById('boardsSearch')) {
        initializeContactSearch();
    }
    
    // Load sample data
    loadSampleData();
}

// Navigation functionality
function initializeNavigation() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Modal functionality
function initializeModals() {
    const newPostBtn = document.getElementById('newPostBtn');
    const newPostModal = document.getElementById('newPostModal');
    const closeModal = document.getElementById('closeModal');
    const cancelPost = document.getElementById('cancelPost');
    const newPostForm = document.getElementById('newPostForm');
    
    if (newPostBtn && newPostModal) {
        // Open modal
        newPostBtn.addEventListener('click', function() {
            newPostModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        
        // Close modal
        function closeNewPostModal() {
            newPostModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (newPostForm) {
                newPostForm.reset();
            }
        }
        
        if (closeModal) {
            closeModal.addEventListener('click', closeNewPostModal);
        }
        
        if (cancelPost) {
            cancelPost.addEventListener('click', closeNewPostModal);
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === newPostModal) {
                closeNewPostModal();
            }
        });
        
        // Handle form submission
        if (newPostForm) {
            newPostForm.addEventListener('submit', function(event) {
                event.preventDefault();
                handleNewPost();
            });
        }
    }
}

// Posts functionality
function initializePosts() {
    // Posts are initialized with sample data
}

function handleNewPost() {
    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value;
    const tags = document.getElementById('postTags').value;
    
    if (!title || !category || !content) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        title: title,
        category: category,
        content: content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        likes: 0,
        comments: 0
    };
    
    posts.unshift(newPost);
    renderPosts();
    
    // Close modal
    document.getElementById('newPostModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('newPostForm').reset();
    
    // Show success message
    showNotification('Post created successfully!', 'success');
}

function renderPosts() {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;
    
    postsGrid.innerHTML = '';
    
    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsGrid.appendChild(postCard);
    });
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card fade-in';
    
    const tagsHtml = post.tags && post.tags.length > 0 
        ? `<div class="post-tags">${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}</div>`
        : '';
    
    card.innerHTML = `
        <div class="post-header">
            <h3>${post.title}</h3>
            <span class="post-date">${post.date}</span>
        </div>
        <div class="post-category">
            <span class="category-badge category-${post.category}">${post.category}</span>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${tagsHtml}
        </div>
        <div class="post-actions">
            <button class="btn btn-secondary btn-sm" onclick="likePost(${post.id})">
                <i class="fas fa-heart"></i> Like (${post.likes})
            </button>
            <button class="btn btn-secondary btn-sm">
                <i class="fas fa-comment"></i> Comment (${post.comments})
            </button>
        </div>
    `;
    
    return card;
}

function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        renderPosts();
        showNotification('Post liked!', 'success');
    }
}

// Events functionality
function initializeEvents() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterType = this.dataset.filter;
            filterEvents(filterType);
        });
    });
    
    renderEvents();
}

function filterEvents(type) {
    const filteredEvents = type === 'all' 
        ? events 
        : events.filter(event => event.type.toLowerCase() === type.toLowerCase());
    
    renderEvents(filteredEvents);
}

function renderEvents(eventsToRender = events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = '';
    
    eventsToRender.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card fade-in';
    
    card.innerHTML = `
        <div class="event-image">
            <i class="fas ${getEventIcon(event.type)}"></i>
        </div>
        <div class="event-content">
            <span class="event-type ${event.type.toLowerCase()}">${event.type}</span>
            <h3 class="event-title">${event.title}</h3>
            <div class="event-date">
                <i class="fas fa-calendar"></i>
                ${event.date}
            </div>
            <div class="event-location">
                <i class="fas fa-map-marker-alt"></i>
                ${event.location}
            </div>
            <p class="event-description">${event.description}</p>
            <button class="btn btn-primary register-btn" onclick="registerForEvent('${event.id}', '${event.title}')">
                <i class="fas fa-user-plus"></i> Register for Event
            </button>
        </div>
    `;
    
    return card;
}

function getEventIcon(type) {
    const icons = {
        'awareness': 'fa-lightbulb',
        'cleanup': 'fa-broom',
        'education': 'fa-graduation-cap',
        'community': 'fa-users',
        'fundraiser': 'fa-donate'
    };
    return icons[type.toLowerCase()] || 'fa-calendar';
}

function registerForEvent(eventId, eventTitle) {
    // Show confirmation alert
    const confirmed = confirm(`Are you sure you want to register for "${eventTitle}"?`);
    
    if (confirmed) {
        // Simulate registration process
        showNotification(`Successfully registered for "${eventTitle}"!`, 'success');
        
        // You could add additional logic here like:
        // - Send registration data to server
        // - Update UI to show registered status
        // - Add event to user's calendar
    }
}

// Contact search functionality
function initializeContactSearch() {
    const searchInput = document.getElementById('boardsSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterStateBoards(searchTerm);
        });
    }
    
    renderStateBoards();
}

function filterStateBoards(searchTerm) {
    const filteredBoards = stateBoards.filter(board => 
        board.name.toLowerCase().includes(searchTerm) ||
        board.state.toLowerCase().includes(searchTerm) ||
        board.contact.toLowerCase().includes(searchTerm)
    );
    
    renderStateBoards(filteredBoards);
}

function renderStateBoards(boardsToRender = stateBoards) {
    const boardsList = document.getElementById('boardsList');
    if (!boardsList) return;
    
    boardsList.innerHTML = '';
    
    if (boardsToRender.length === 0) {
        boardsList.innerHTML = '<p class="text-center">No state boards found matching your search.</p>';
        return;
    }
    
    boardsToRender.forEach(board => {
        const boardCard = createBoardCard(board);
        boardsList.appendChild(boardCard);
    });
}

function createBoardCard(board) {
    const card = document.createElement('div');
    card.className = 'board-card fade-in';
    
    card.innerHTML = `
        <h3 class="board-name">${board.name}</h3>
        <p class="board-contact"><strong>State:</strong> ${board.state}</p>
        <p class="board-contact"><strong>Phone:</strong> ${board.phone}</p>
        <p class="board-contact"><strong>Email:</strong> ${board.email}</p>
        <p class="board-contact"><strong>Website:</strong> <a href="${board.website}" target="_blank">${board.website}</a></p>
    `;
    
    return card;
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Load sample data
function loadSampleData() {
    // Sample posts
    posts = [
        {
            id: 1,
            title: "Welcome to the Community",
            category: "announcement",
            content: "This is a sample post to demonstrate the layout. Click 'New Post' to create your own!",
            tags: ["welcome", "community"],
            date: "October 1, 2025",
            likes: 5,
            comments: 2
        }
    ];
    
    // Sample events
    events = [
        {
            id: "event1",
            title: "Community Awareness Workshop",
            type: "Awareness",
            date: "October 15, 2025",
            location: "Community Center, Main St",
            description: "Join us for an informative workshop about community issues and how you can make a difference."
        },
        {
            id: "event2",
            title: "Park Clean-up Day",
            type: "Clean-up",
            date: "October 22, 2025",
            location: "Central Park",
            description: "Help us keep our parks beautiful! Bring gloves and enthusiasm. Supplies will be provided."
        },
        {
            id: "event3",
            title: "Educational Seminar: Sustainable Living",
            type: "Education",
            date: "November 5, 2025",
            location: "Library Conference Room",
            description: "Learn practical tips for sustainable living and reducing your environmental footprint."
        },
        {
            id: "event4",
            title: "Community Fundraiser Dinner",
            type: "Fundraiser",
            date: "November 12, 2025",
            location: "Town Hall",
            description: "Join us for a delicious dinner while supporting local community projects."
        }
    ];
    
    // Sample state boards
    stateBoards = [
        {
            name: "California State Board",
            state: "California",
            phone: "(555) 123-4567",
            email: "info@castateboard.gov",
            website: "https://www.castateboard.gov"
        },
        {
            name: "Texas State Board",
            state: "Texas",
            phone: "(555) 234-5678",
            email: "contact@txstateboard.gov",
            website: "https://www.txstateboard.gov"
        },
        {
            name: "New York State Board",
            state: "New York",
            phone: "(555) 345-6789",
            email: "info@nystateboard.gov",
            website: "https://www.nystateboard.gov"
        },
        {
            name: "Florida State Board",
            state: "Florida",
            phone: "(555) 456-7890",
            email: "contact@flstateboard.gov",
            website: "https://www.flstateboard.gov"
        },
        {
            name: "Illinois State Board",
            state: "Illinois",
            phone: "(555) 567-8901",
            email: "info@ilstateboard.gov",
            website: "https://www.ilstateboard.gov"
        }
    ];
    
    // Render initial data
    if (document.getElementById('postsGrid')) {
        renderPosts();
    }
    if (document.getElementById('eventsGrid')) {
        renderEvents();
    }
    if (document.getElementById('boardsList')) {
        renderStateBoards();
    }
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .category-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
        margin-bottom: 1rem;
    }
    
    .category-general {
        background: #3498db;
        color: white;
    }
    
    .category-announcement {
        background: #e74c3c;
        color: white;
    }
    
    .category-question {
        background: #f39c12;
        color: white;
    }
    
    .category-event {
        background: #9b59b6;
        color: white;
    }
    
    .post-tags {
        margin-top: 1rem;
    }
    
    .tag {
        display: inline-block;
        background: #ecf0f1;
        color: #7f8c8d;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
    }
`;
document.head.appendChild(style);