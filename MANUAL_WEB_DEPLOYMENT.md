# 🌐 Manual Web Deployment Guide - Appwrite Console

## Issue: Appwrite Sites CLI Queue Delays

The CLI deployment is stuck in Appwrite's build queue. You can deploy faster using the Appwrite Console web interface.

---

## ✅ OPTION 1: Manual Deployment via Appwrite Console (RECOMMENDED - 2 minutes)

### Step 1: Access Your Site in Appwrite Console

1. Go to: **https://cloud.appwrite.io/console/project-involvex/sites**
2. Click on **"involvex-web"** site

### Step 2: Create New Deployment

1. Click **"Create Deployment"** button
2. Choose **"Manual Upload"** or **"Upload Archive"**

### Step 3: Upload Your Web Build

**Option A: Drag & Drop**
- Drag the entire `build\web` folder to the upload area

**Option B: Create ZIP Archive First**
1. Navigate to: `D:\repos\involvex\involvex-android-app\build\web`
2. Select all files in the `web` folder
3. Right-click → "Send to" → "Compressed (zipped) folder"
4. Name it: `involvex-web.zip`
5. Upload the ZIP file in Appwrite Console

### Step 4: Configure Deployment Settings

- **Output Directory**: `./` (root)
- **Fallback File**: `index.html`
- **Auto-activate**: ✅ Enabled

### Step 5: Deploy

1. Click **"Create Deployment"**
2. Wait for build to complete (~1-2 minutes)
3. Site will be live at: `https://involvex-web.fra.appwrite.io`

---

## ✅ OPTION 2: Create ZIP and Deploy via CLI (Alternative)

If you prefer CLI, create a proper ZIP archive:

### Step 1: Create Deployment Archive

```bash
# Navigate to build output
cd build\web

# Create ZIP with all files
powershell -Command "Compress-Archive -Path * -DestinationPath ..\..\involvex-web.zip -Force"

# Return to project root
cd ..\..
```

### Step 2: Deploy ZIP via CLI

```bash
appwrite sites create-deployment --site-id involvex-web --code "involvex-web.zip" --activate true
```

---

## ✅ OPTION 3: Use Appwrite's Built-in Web Hosting

Since the site is already created, you can also:

### Via Console (Easiest):

1. Go to: **https://cloud.appwrite.io/console/project-involvex/sites/involvex-web**
2. Click **"Deployments"** tab
3. Click **"Create deployment"** button
4. Select **"Upload files"**
5. Upload the contents of `build\web` directory
6. Click **"Deploy"**

---

## 🌐 Your Web App URL

Once deployed, your web app will be accessible at:

```
https://involvex-web.fra.appwrite.io
```

Or check the exact URL in the Appwrite Console under your site settings.

---

## 🔧 Alternative: Use GitHub Pages (Free Static Hosting)

If you prefer not to use Appwrite Sites, you can deploy to GitHub Pages:

### Quick Setup:

1. **Create GitHub Repository** (if not already created)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/involvex-android-app.git
   git push -u origin main
   ```

2. **Deploy to GitHub Pages**
   ```bash
   # Copy web build to docs folder (GitHub Pages source)
   xcopy /E /I build\web docs

   git add docs
   git commit -m "Deploy web app"
   git push
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to "Pages"
   - Source: Deploy from branch
   - Branch: `main`, folder: `/docs`
   - Save

4. **Access Your Site**
   - URL: `https://YOUR_USERNAME.github.io/involvex-android-app/`

---

## 🎯 RECOMMENDED APPROACH

**For fastest deployment right now:**

1. ✅ Go to Appwrite Console: https://cloud.appwrite.io/console/project-involvex/sites/involvex-web
2. ✅ Click "Create deployment"
3. ✅ Upload the `build\web` folder contents
4. ✅ Deploy and wait ~1-2 minutes
5. ✅ Access at `https://involvex-web.fra.appwrite.io`

**This bypasses the CLI queue issues and deploys immediately.**

---

## 📝 What's Already Configured

✅ Site created: `involvex-web`
✅ Web platform registered
✅ Android platform registered
✅ Production APK ready

All you need is to upload the web files via Console!

---

*Manual deployment is often faster than CLI for initial deployments due to queue processing times.*
