const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/avi'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// Helper function to generate unique 6-character code
function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes

// Home route - redirect to dashboard if authenticated
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Login page
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Login handler
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.render('login', { error: error.message });
    }

    // Store user session
    req.session.user = {
      id: data.user.id,
      email: data.user.email
    };

    res.redirect('/dashboard');
  } catch (error) {
    res.render('login', { error: 'An error occurred during login' });
  }
});

// Signup page
app.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('signup', { error: null });
});

// Signup handler
app.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      return res.render('signup', { error: error.message });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    res.render('signup', { 
      error: null, 
      success: 'Account created successfully! Please check your email to confirm your account.' 
    });
  } catch (error) {
    res.render('signup', { error: 'An error occurred during signup' });
  }
});

// Logout handler
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/login');
  });
});

// Dashboard - protected route
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    // Get user's devices
    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .eq('owner_id', req.session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching devices:', error);
      return res.render('dashboard', { 
        user: req.session.user, 
        devices: [], 
        error: 'Error loading devices' 
      });
    }

    res.render('dashboard', { 
      user: req.session.user, 
      devices: devices || [], 
      error: null 
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('dashboard', { 
      user: req.session.user, 
      devices: [], 
      error: 'An error occurred' 
    });
  }
});

// Generate new device code
app.post('/generate-code', requireAuth, async (req, res) => {
  try {
    const { deviceName } = req.body;
    const uniqueCode = generateUniqueCode();
    
    const { data, error } = await supabase
      .from('devices')
      .insert({
        owner_id: req.session.user.id,
        unique_code: uniqueCode,
        device_name: deviceName || `Device ${Date.now()}`,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating device:', error);
      return res.json({ success: false, error: error.message });
    }

    res.json({ 
      success: true, 
      device: data,
      message: 'Device code generated successfully!' 
    });
  } catch (error) {
    console.error('Generate code error:', error);
    res.json({ success: false, error: 'An error occurred' });
  }
});

// Content management page
app.get('/content', requireAuth, async (req, res) => {
  try {
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('owner_id', req.session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching content:', error);
      return res.render('content', { 
        user: req.session.user, 
        content: [], 
        error: 'Error loading content' 
      });
    }

    res.render('content', { 
      user: req.session.user, 
      content: content || [], 
      error: null 
    });
  } catch (error) {
    console.error('Content page error:', error);
    res.render('content', { 
      user: req.session.user, 
      content: [], 
      error: 'An error occurred' 
    });
  }
});

// Upload content handler
app.post('/upload-content', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `content/${req.session.user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('content')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.json({ success: false, error: uploadError.message });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('content')
      .getPublicUrl(filePath);

    // Save to content table
    const { data, error } = await supabase
      .from('content')
      .insert({
        owner_id: req.session.user.id,
        file_url: urlData.publicUrl,
        content_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        file_name: file.originalname,
        file_size: file.size
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.json({ success: false, error: error.message });
    }

    res.json({ 
      success: true, 
      content: data,
      message: 'Content uploaded successfully!' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.json({ success: false, error: 'An error occurred during upload' });
  }
});

// Playlist management page
app.get('/playlist/:deviceId', requireAuth, async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Verify device ownership
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceId)
      .eq('owner_id', req.session.user.id)
      .single();

    if (deviceError || !device) {
      return res.status(404).render('error', { 
        message: 'Device not found or access denied' 
      });
    }

    // Get user's content
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .eq('owner_id', req.session.user.id)
      .order('created_at', { ascending: false });

    // Get device playlists
    const { data: playlists, error: playlistError } = await supabase
      .from('playlists')
      .select(`
        *,
        content:content_id(*)
      `)
      .eq('device_id', deviceId)
      .order('order_index', { ascending: true });

    if (contentError || playlistError) {
      console.error('Error fetching data:', contentError || playlistError);
      return res.render('playlist', { 
        user: req.session.user, 
        device: device,
        content: content || [], 
        playlists: playlists || [],
        error: 'Error loading playlist data' 
      });
    }

    res.render('playlist', { 
      user: req.session.user, 
      device: device,
      content: content || [], 
      playlists: playlists || [],
      error: null 
    });
  } catch (error) {
    console.error('Playlist page error:', error);
    res.render('playlist', { 
      user: req.session.user, 
      device: null,
      content: [], 
      playlists: [],
      error: 'An error occurred' 
    });
  }
});

// Add content to playlist
app.post('/playlist/:deviceId/add', requireAuth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { contentId, startTime, endTime, orderIndex } = req.body;

    // Verify device ownership
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceId)
      .eq('owner_id', req.session.user.id)
      .single();

    if (deviceError || !device) {
      return res.json({ success: false, error: 'Device not found or access denied' });
    }

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        device_id: deviceId,
        content_id: contentId,
        start_time: startTime,
        end_time: endTime,
        order_index: parseInt(orderIndex) || 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Playlist insert error:', error);
      return res.json({ success: false, error: error.message });
    }

    res.json({ 
      success: true, 
      playlist: data,
      message: 'Content added to playlist successfully!' 
    });
  } catch (error) {
    console.error('Add to playlist error:', error);
    res.json({ success: false, error: 'An error occurred' });
  }
});

// Force stop playback
app.post('/playlist/:deviceId/force-stop', requireAuth, async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Verify device ownership
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceId)
      .eq('owner_id', req.session.user.id)
      .single();

    if (deviceError || !device) {
      return res.json({ success: false, error: 'Device not found or access denied' });
    }

    // Update all active playlists to stopped status
    const { error } = await supabase
      .from('playlists')
      .update({ status: 'stopped' })
      .eq('device_id', deviceId)
      .eq('status', 'active');

    if (error) {
      console.error('Force stop error:', error);
      return res.json({ success: false, error: error.message });
    }

    res.json({ 
      success: true, 
      message: 'Force stop command sent successfully!' 
    });
  } catch (error) {
    console.error('Force stop error:', error);
    res.json({ success: false, error: 'An error occurred' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).render('error', { 
    message: 'An internal server error occurred' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Digital Signage CMS server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the application`);
});