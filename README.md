# 🎬 Digital Signage System

[![Deploy to GitHub Pages](https://github.com/yourusername/digital-signage-system/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/yourusername/digital-signage-system/actions)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://yourusername.github.io/digital-signage-system/)

A robust, real-time digital signage system consisting of a web-based Content Management System (CMS) for ad owners and a desktop client (Player) that runs on displays. Supabase serves as the backend, handling authentication, database management, and real-time data synchronization.

## 🚀 Live Demo

**Try the system online:** [https://yourusername.github.io/digital-signage-system/](https://yourusername.github.io/digital-signage-system/)

*Note: The live demo requires you to set up your own Supabase backend for full functionality.*

## System Architecture

### Components
1. **Supabase Backend**: Database, authentication, real-time subscriptions, and file storage
2. **Web CMS**: Node.js/Express application for content management
3. **Desktop Player**: Electron application for content playback

### Features
- Real-time content synchronization
- Multi-device management
- Content scheduling with time-based playlists
- Force stop functionality
- Device status monitoring
- Secure authentication and authorization

## Setup Instructions

### Phase 1: Supabase Setup

1. Create a new Supabase project
2. Run the SQL commands from `supabase-setup.json` in your Supabase SQL editor
3. Create a storage bucket named `content` for file uploads
4. Update `.env.local` with your Supabase credentials

### Phase 2: CMS Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update `.env.local` with your configuration:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SESSION_SECRET=your_session_secret
   ```

3. Start the CMS server:
   ```bash
   npm start
   ```

4. Access the CMS at `http://localhost:3000`

### Phase 3: Player Setup

1. Navigate to the player directory:
   ```bash
   cd player
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `player/.env.local` with your Supabase credentials

4. Start the player:
   ```bash
   npm start
   ```

## Usage

### CMS (Content Management System)

1. **Sign Up/Login**: Create an account or login to access the dashboard
2. **Generate Device Code**: Create a unique 6-character code for your display device
3. **Upload Content**: Upload images and videos to your content library
4. **Manage Playlists**: Schedule content for specific devices with start/end times
5. **Monitor Devices**: View device status and connection information

### Player (Desktop Client)

1. **Enter Device Code**: Input the 6-character code generated from the CMS
2. **Automatic Connection**: The player connects to the server and subscribes to real-time updates
3. **Content Playback**: Displays scheduled content based on playlists
4. **Real-time Updates**: Automatically updates when content or schedules change
5. **Force Stop**: Responds to force stop commands from the CMS

## Database Schema

### Tables

- **users**: Ad owner profiles linked to Supabase auth
- **devices**: Player devices with unique codes and status tracking
- **content**: Uploaded media files with metadata
- **playlists**: Scheduled content with time-based playback

### Security

- Row Level Security (RLS) policies ensure data isolation
- Users can only access their own devices, content, and playlists
- Secure file uploads with type validation

## Real-time Features

- Device status updates (pending → active → offline)
- Playlist changes and content updates
- Force stop commands
- Heartbeat monitoring for connection status

## File Structure

```
├── supabase-setup.json          # Database setup SQL commands
├── .env.local                   # CMS environment configuration
├── package.json                 # CMS dependencies
├── server.js                    # Express server with all routes
├── views/                       # EJS templates
│   ├── layout.ejs
│   ├── login.ejs
│   ├── signup.ejs
│   ├── dashboard.ejs
│   ├── content.ejs
│   ├── playlist.ejs
│   └── error.ejs
└── player/                      # Electron desktop client
    ├── package.json
    ├── main.js                  # Electron main process
    ├── index.html               # Player UI
    ├── renderer.js              # Player logic and Supabase integration
    └── .env.local               # Player environment configuration
```

## Development

### CMS Development
- Uses Express.js with EJS templating
- Session-based authentication
- File upload with Multer
- Supabase client for database operations

### Player Development
- Electron for cross-platform desktop app
- Real-time subscriptions with Supabase
- Automatic content scheduling
- Error handling and reconnection logic

## Production Deployment

### CMS
- Deploy to platforms like Heroku, Vercel, or AWS
- Set up environment variables
- Configure HTTPS and secure sessions
- Set up file storage (Supabase Storage or AWS S3)

### Player
- Build executables with `electron-builder`
- Distribute to display devices
- Set up auto-update mechanism
- Configure for kiosk mode

## Troubleshooting

### Common Issues

1. **Device not connecting**: Check Supabase URL and API key
2. **Content not playing**: Verify file URLs and content type
3. **Real-time updates not working**: Check Supabase Realtime configuration
4. **File upload failures**: Verify storage bucket permissions

### Logs

- CMS logs are output to console
- Player logs are available in Electron DevTools
- Supabase logs are available in the Supabase dashboard

## Security Considerations

- Use HTTPS in production
- Implement proper session management
- Validate all file uploads
- Monitor device connections
- Regular security updates

## License

MIT License - see LICENSE file for details