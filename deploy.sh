#!/bin/bash
# Quick deployment script for GitHub Pages

echo "🚀 Deploying Team Attendance Tracker to GitHub Pages"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ This is not a git repository. Please follow the setup guide first."
    exit 1
fi

# Add all changes
echo "📁 Adding files..."
git add .

# Get commit message from user or use default
if [ -z "$1" ]; then
    COMMIT_MSG="Update attendance tracker - $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# Commit changes
echo "💾 Committing changes: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "📱 Your site will be available at:"
echo "   https://$(git config --get remote.origin.url | sed 's/.*github\.com[:/]\([^/]*\)\/\([^/.]*\).*/\1.github.io\/\2/')/"
echo ""
echo "⏰ Changes may take 1-2 minutes to appear online."
