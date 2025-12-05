# Firebase Setup Guide for 15L Learning Goals Website

## Quick Summary
Firebase is **FREE** for this project! The free tier includes everything you need.

## Step-by-Step Setup (15 minutes)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `15L Learning Goals` (or any name)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Register Your Web App
1. In your Firebase project dashboard, click the **web icon** (`</>`)
2. App nickname: `Learning Goals Website`
3. **Don't** check "Firebase Hosting"
4. Click **"Register app"**
5. **COPY the firebaseConfig object** - you'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

### 3. Enable Anonymous Authentication
1. In Firebase Console, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Find **"Anonymous"** and click on it
5. Toggle the switch to **"Enable"**
6. Click **"Save"**

### 4. Enable Firestore Database
1. Click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select a location (choose closest to your location)
5. Click **"Enable"**

### 5. Configure Your Project
1. Open the file `.env.local` in your project root (I created it for you)
2. Replace the placeholder values with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

### 6. Restart Your Dev Server
1. Stop the running dev server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Visit http://localhost:3000
4. Comments should now work! 🎉

## Security Rules (Important for Production!)

Before deploying publicly, update Firestore rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/comments/{comment} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

## Cost
- **FREE** for this project
- Firebase Spark (free) plan includes:
  - Unlimited authentication
  - 1 GB Firestore storage
  - 10 GB/month data transfer
  - More than enough for hundreds of comments!

## Troubleshooting

**Comments not working?**
- Check that `.env.local` has correct values
- Restart dev server after changing `.env.local`
- Check browser console for errors

**Still seeing "Firebase not configured"?**
- Make sure all environment variables start with `NEXT_PUBLIC_`
- Verify no typos in `.env.local`
- Try `npm run dev` again

## Alternative: Simple Comments Without Firebase

If you prefer not to use Firebase, I can implement a simpler solution using:
- Local storage (comments saved in browser only)
- Or a simpler backend like Supabase
- Or just remove comments feature entirely

Let me know if you'd like to explore these options!
