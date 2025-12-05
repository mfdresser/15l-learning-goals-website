# Complete Vercel Deployment Guide

## Step 1: Create a GitHub Account (if you don't have one)

1. Go to https://github.com/signup
2. Enter your email address
3. Create a password
4. Choose a username
5. Verify your account via email

## Step 2: Create a New Repository on GitHub

1. Go to https://github.com/new
2. **Repository name**: `15l-learning-goals-website`
3. **Description** (optional): "Physics lab learning goals showcase"
4. **Visibility**: Choose "Public" (or "Private" if you prefer)
5. **DO NOT** check "Initialize with README" (you already have files)
6. Click **"Create repository"**

## Step 3: Push Your Code to GitHub

GitHub will show you commands to run. Open your terminal and run:

```bash
cd "/Users/makee/Documents/Grad school/PER/Bok Center Materials/Bok Graduat Fellow Position/15L Lab Development/Create a website/15l-learning-goals-website"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/15l-learning-goals-website.git

# Push your code
git push -u origin main
```

**If you get an authentication error:**
- GitHub may ask for your username and password
- You'll need to create a Personal Access Token instead of using your password
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Give it a name like "Vercel Deploy"
- Check "repo" scope
- Generate and copy the token
- Use this token as your password when pushing

## Step 4: Deploy to Vercel

### 4a. Create Vercel Account

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. You'll be redirected to Vercel dashboard

### 4b. Import Your Project

1. Click **"Add New..."** button (top right)
2. Select **"Project"**
3. You'll see your GitHub repositories
4. Find **"15l-learning-goals-website"**
5. Click **"Import"**

### 4c. Configure Project

Vercel will auto-detect it's a Next.js project. You should see:
- **Framework Preset**: Next.js (auto-detected ✓)
- **Root Directory**: ./ (correct ✓)
- **Build Command**: `npm run build` (correct ✓)
- **Output Directory**: .next (correct ✓)

**IMPORTANT: Add Environment Variables**

1. Click **"Environment Variables"** section (expand it)
2. Add each of these variables (copy from your `.env.local` file):

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyDq5kHsi2HfQJ5WmfZoA197eZUI23gglvw

Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: l-learning-goals.firebaseapp.com

Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: l-learning-goals

Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: l-learning-goals.firebasestorage.app

Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 607521393742

Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:607521393742:web:3c3c42fc814aca318fc71f
```

**For each variable:**
- Type the name in "Name" field
- Type the value in "Value" field
- Click "Add"
- Repeat for all 6 variables

3. After adding all variables, click **"Deploy"**

### 4d. Wait for Deployment

- Vercel will build and deploy your site (takes 2-3 minutes)
- You'll see a progress screen with logs
- When done, you'll see: **"Congratulations! 🎉"**

## Step 5: View Your Live Website

1. Click **"Visit"** button or the domain name shown
2. Your site will be live at a URL like: `https://15l-learning-goals-website.vercel.app`
3. **Share this URL with anyone!** It's now accessible worldwide

## Step 6: Test Everything

1. Visit your live URL
2. Check that the page loads correctly
3. **Test comments feature**:
   - Try posting a comment
   - Check if it appears
   - Open Firebase Console to verify it was saved
4. Test on different devices (phone, tablet)

## Future Updates

### To update your website:

1. Make changes to your code locally
2. Test locally with `npm run dev`
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. **Vercel automatically deploys!** (within 1-2 minutes)
5. Visit your URL to see the updates

## Custom Domain (Optional)

Want a custom domain like `physics-lab.com`?

1. Buy a domain from Namecheap, GoDaddy, etc.
2. In Vercel dashboard, go to your project
3. Click "Settings" → "Domains"
4. Add your custom domain
5. Follow Vercel's instructions to configure DNS

## Troubleshooting

### Comments not working on live site?
- Check that all environment variables are added in Vercel
- Verify they match exactly (no typos)
- Check Firebase Console for errors

### Build failed?
- Check the build logs in Vercel
- Make sure your code works locally first (`npm run build`)
- Check that all dependencies are in `package.json`

### Getting authentication errors with Git?
- Use a Personal Access Token instead of password
- Go to: https://github.com/settings/tokens

## Your URLs

After deployment, save these:

- **Live Website**: (you'll get this after deployment)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/YOUR_USERNAME/15l-learning-goals-website
- **Firebase Console**: https://console.firebase.google.com/

## Summary of What You Did

✅ Committed your code to Git
✅ Created GitHub repository
✅ Pushed code to GitHub
✅ Created Vercel account
✅ Connected GitHub to Vercel
✅ Added Firebase environment variables
✅ Deployed your website
✅ Your site is now live and accessible worldwide!

---

**Need help?** Contact Vercel support at https://vercel.com/contact