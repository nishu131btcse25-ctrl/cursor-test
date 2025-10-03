#!/bin/bash

# Digital Signage System - GitHub Setup Script
# This script helps you set up the GitHub repository and deploy to GitHub Pages

echo "🎬 Digital Signage System - GitHub Setup"
echo "========================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Get repository name from user
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (default: digital-signage-system): " REPO_NAME
REPO_NAME=${REPO_NAME:-digital-signage-system}

echo ""
echo "📋 Setup Instructions:"
echo "======================"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: $REPO_NAME"
echo "   - Description: Digital Signage System with CMS and Desktop Player"
echo "   - Make it Public"
echo "   - Don't initialize with README (we already have files)"
echo ""
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo ""
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Enable GitHub Pages:"
echo "   - Go to repository Settings > Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: gh-pages"
echo "   - Folder: / (root)"
echo ""
echo "5. Update URLs in files:"
echo "   - Replace 'yourusername' with '$GITHUB_USERNAME' in:"
echo "     - README.md"
echo "     - docs/index.html"
echo "     - .github/workflows/deploy.yml"
echo ""

# Update files with the provided username
echo "🔧 Updating files with your GitHub username..."

# Update README.md
sed -i "s/yourusername/$GITHUB_USERNAME/g" README.md

# Update docs/index.html
sed -i "s/yourusername/$GITHUB_USERNAME/g" docs/index.html

# Update .github/workflows/deploy.yml
sed -i "s/digital-signage-system.github.io/$GITHUB_USERNAME.github.io/g" docs/CNAME

echo "✅ Files updated successfully!"
echo ""
echo "🚀 Next Steps:"
echo "============="
echo "1. Create the GitHub repository as described above"
echo "2. Run the git commands shown above"
echo "3. Wait for GitHub Actions to deploy to Pages"
echo "4. Your live demo will be available at:"
echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo ""
echo "📱 Desktop Player:"
echo "=================="
echo "To build and distribute the desktop player:"
echo "1. cd player"
echo "2. npm install"
echo "3. npm run build"
echo "4. Upload the built files to GitHub Releases"
echo ""
echo "🎉 Setup complete! Your Digital Signage System is ready for GitHub Pages deployment."