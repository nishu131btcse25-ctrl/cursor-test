# 🚀 Deployment Guide

This guide will help you deploy the Digital Signage System to GitHub Pages and set up the complete system.

## 📋 Prerequisites

- GitHub account
- Supabase account (free tier available)
- Node.js installed locally (for development)

## 🎯 Quick Deployment to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `digital-signage-system`
3. Make it **Public** (required for GitHub Pages)
4. **Don't** initialize with README (we already have files)

### Step 2: Push Your Code

```bash
# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/digital-signage-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository **Settings** > **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` (will be created by GitHub Actions)
4. **Folder**: `/ (root)`
5. Click **Save**

### Step 4: Update Configuration

Replace `yourusername` with your actual GitHub username in these files:
- `README.md`
- `docs/index.html`
- `docs/CNAME`

### Step 5: Wait for Deployment

GitHub Actions will automatically:
- Build the project
- Deploy to GitHub Pages
- Make it available at `https://YOUR_USERNAME.github.io/digital-signage-system/`

## 🗄️ Supabase Backend Setup

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your **Project URL** and **Anon Key**

### Step 2: Set Up Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and run all SQL commands from `supabase-setup.json`
3. Go to **Storage** and create a bucket named `content`
4. Set bucket to **Public** for file access

### Step 3: Configure Authentication

1. Go to **Authentication** > **Settings**
2. Configure your site URL: `https://YOUR_USERNAME.github.io/digital-signage-system/`
3. Add redirect URLs as needed

## 🖥️ Desktop Player Setup

### Development

```bash
cd player
npm install
npm start
```

### Building for Distribution

```bash
cd player
npm install
npm run build
```

This creates platform-specific executables in the `dist/` folder.

### GitHub Releases

1. Go to your repository **Releases**
2. Create a new release
3. Upload the built player executables
4. Users can download and install the player

## 🔧 Full CMS Setup (Optional)

For the complete Node.js CMS (not just the static demo):

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Start the server
npm start
```

## 🌐 Custom Domain (Optional)

1. Add your domain to `docs/CNAME`
2. Configure DNS with your domain provider
3. Update GitHub Pages settings

## 📊 Monitoring and Analytics

- **GitHub Actions**: Monitor deployment status
- **Supabase Dashboard**: Monitor database usage and performance
- **GitHub Insights**: Track repository activity

## 🔒 Security Considerations

- Use HTTPS in production
- Regularly update dependencies
- Monitor Supabase usage limits
- Implement proper error handling
- Use environment variables for secrets

## 🆘 Troubleshooting

### GitHub Pages Not Updating
- Check GitHub Actions workflow status
- Verify branch and folder settings
- Wait 5-10 minutes for propagation

### Supabase Connection Issues
- Verify Project URL and Anon Key
- Check RLS policies are enabled
- Ensure storage bucket exists and is public

### Player Not Connecting
- Verify device code is correct
- Check Supabase connection
- Review browser console for errors

## 📞 Support

- **Issues**: Create GitHub issues for bugs
- **Documentation**: Check README.md
- **Community**: Use GitHub Discussions

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live demo at GitHub Pages
- ✅ Complete source code repository
- ✅ Automated deployment pipeline
- ✅ Desktop player for distribution
- ✅ Supabase backend for data management

Your Digital Signage System is now live and ready to use! 🎬