# Deploy to GitHub Pages - Step by Step Guide

## Prerequisites
- GitHub account (free)
- Git installed on your computer
- Your attendance tracker files ready

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in top right corner → "New repository"
3. Repository settings:
   - **Repository name**: `team-attendance-tracker` (or any name you prefer)
   - **Description**: "Web-based team attendance tracker with Excel export"
   - ✅ **Public** (required for free GitHub Pages)
   - ✅ **Add a README file**
   - **Add .gitignore**: None needed
   - **Choose a license**: MIT License (recommended)
4. Click **"Create repository"**

## Step 2: Clone Repository to Your Computer

```bash
# Replace 'your-username' with your GitHub username
git clone https://github.com/your-username/team-attendance-tracker.git
cd team-attendance-tracker
```

## Step 3: Add Your Files

Copy all these files to the cloned repository folder:
- ✅ `index.html`
- ✅ `user-attendance.html`
- ✅ `script.js`
- ✅ `user-script.js`
- ✅ `styles.css`
- ✅ `README.md`
- ✅ `server.py`
- ✅ `start-server.bat`

## Step 4: Commit and Push Files

```bash
# Add all files to git
git add .

# Commit files
git commit -m "Add team attendance tracker files"

# Push to GitHub
git push origin main
```

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub.com
2. Click **"Settings"** tab (top right of repository)
3. Scroll down to **"Pages"** section in left sidebar
4. Under **"Source"**, select:
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root)
5. Click **"Save"**

## Step 6: Access Your Live Site

After 5-10 minutes, your site will be available at:
```
https://your-username.github.io/team-attendance-tracker/
```

For the user version:
```
https://your-username.github.io/team-attendance-tracker/user-attendance.html
```

## Benefits of GitHub Pages Hosting

✅ **Free hosting** - No cost, no limits for public repositories
✅ **HTTPS by default** - Secure connection, localStorage works perfectly
✅ **Custom domain support** - You can use your own domain later
✅ **Automatic updates** - Push changes and they go live automatically
✅ **CDN powered** - Fast loading worldwide
✅ **Version control** - Full history of all changes

## Quick Commands Cheat Sheet

```bash
# Make changes to files, then:
git add .
git commit -m "Update attendance tracker"
git push origin main

# Your changes will be live in 1-2 minutes!
```

## Sharing Your Application

Once live, you can share these URLs:

**For Admins (Team Management):**
`https://your-username.github.io/team-attendance-tracker/`

**For Users (Attendance Only):**
`https://your-username.github.io/team-attendance-tracker/user-attendance.html`

## Optional: Custom Domain

If you have a custom domain (like `attendance.yourcompany.com`):
1. Add a file named `CNAME` with your domain name
2. Configure DNS settings with your domain provider
3. Enable HTTPS in GitHub Pages settings

## Troubleshooting

**Site not loading?**
- Wait 10 minutes after enabling Pages
- Check repository is public
- Ensure `index.html` is in root folder

**Files not updating?**
- Clear browser cache (Ctrl+F5)
- Check commit was pushed: `git log --oneline -5`

**localStorage not working?**
- Should work automatically with HTTPS
- Clear browser data and try again

Your attendance tracker will now work perfectly with full localStorage support!
