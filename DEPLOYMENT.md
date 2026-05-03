# 🚀 Deployment Guide for DevDriftGuard

This guide will walk you through deploying DevDriftGuard to production using Render (recommended) or Railway.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub account with repository access
- [ ] GitHub Personal Access Token (with `repo` scope)
- [ ] NVIDIA API Key for IBM Bob
- [ ] Render or Railway account (free tier works)
- [ ] All code committed and pushed to GitHub

---

## 🎯 Option 1: Deploy to Render (Recommended)

Render offers free hosting with automatic deployments from GitHub.

### Step 1: Prepare Your Repository

1. **Push to GitHub:**
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DevDriftGuard ready for deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/devdriftguard.git

# Push to GitHub
git push -u origin main
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Deploy Backend

1. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `devdriftguard` repository

2. **Configure Backend Service:**
   ```
   Name: devdriftguard-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

3. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   ```
   NODE_ENV = production
   PORT = 3000
   GITHUB_TOKEN = your_github_personal_access_token
   NVIDIA_API_KEY = your_nvidia_api_key
   MAX_FILES_TO_SCAN = 100
   DEVELOPER_HOURLY_RATE = 50
   ```

4. **Create Web Service**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://devdriftguard-backend.onrender.com`

### Step 4: Deploy Frontend

1. **Create New Static Site:**
   - Click "New +" → "Static Site"
   - Select same repository

2. **Configure Frontend Service:**
   ```
   Name: devdriftguard-frontend
   Branch: main
   Root Directory: (leave empty)
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

3. **Add Environment Variable:**
   ```
   VITE_API_URL = https://devdriftguard-backend.onrender.com
   ```

4. **Create Static Site**
   - Click "Create Static Site"
   - Wait for deployment (3-5 minutes)
   - Your app is live at: `https://devdriftguard-frontend.onrender.com`

### Step 5: Update Frontend API URL

1. **Create `frontend/.env.production`:**
```env
VITE_API_URL=https://devdriftguard-backend.onrender.com
```

2. **Update `frontend/vite.config.ts`:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

3. **Commit and push:**
```bash
git add .
git commit -m "Configure production API URL"
git push
```

Render will automatically redeploy!

---

## 🚂 Option 2: Deploy to Railway

Railway offers simple deployment with automatic HTTPS.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Deploy Backend

```bash
# Initialize Railway project
railway init

# Link to your project
railway link

# Add environment variables
railway variables set GITHUB_TOKEN=your_token
railway variables set NVIDIA_API_KEY=your_key
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Step 4: Deploy Frontend

```bash
# Navigate to frontend
cd frontend

# Create new Railway service
railway init

# Add environment variable
railway variables set VITE_API_URL=https://your-backend-url.railway.app

# Deploy
railway up
```

### Step 5: Get Your URLs

```bash
# Backend URL
railway domain

# Frontend URL
cd frontend
railway domain
```

---

## 🔧 Post-Deployment Configuration

### 1. Test Your Deployment

Visit your frontend URL and test:
- [ ] Homepage loads
- [ ] Can enter GitHub repo URL
- [ ] Scan functionality works
- [ ] Issues display correctly
- [ ] Auto-fix generates code
- [ ] PR creation works
- [ ] Dashboard shows metrics
- [ ] PDF export works

### 2. Update README

Update your README.md with live demo link:
```markdown
[Live Demo](https://devdriftguard-frontend.onrender.com)
```

### 3. Configure Custom Domain (Optional)

**On Render:**
1. Go to your static site settings
2. Click "Custom Domains"
3. Add your domain (e.g., `devdriftguard.com`)
4. Update DNS records as instructed

**On Railway:**
```bash
railway domain add yourdomain.com
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend fails to start
```bash
# Check logs on Render
# Dashboard → Your Service → Logs

# Common fixes:
1. Verify environment variables are set
2. Check Node.js version (should be 18+)
3. Ensure build command completed successfully
```

**Problem:** API returns 500 errors
```bash
# Check if NVIDIA_API_KEY is valid
# Check if GITHUB_TOKEN has correct permissions
# Verify API endpoint URLs in frontend
```

### Frontend Issues

**Problem:** Frontend shows blank page
```bash
# Check browser console for errors
# Verify VITE_API_URL is correct
# Ensure backend is running
```

**Problem:** API calls fail with CORS errors
```bash
# Add CORS headers in backend (src/index.ts):
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

### Build Issues

**Problem:** Build fails on Render
```bash
# Check build logs
# Common fixes:
1. Ensure package.json has all dependencies
2. Verify TypeScript compiles locally
3. Check Node.js version compatibility
```

---

## 📊 Monitoring & Maintenance

### Health Checks

Add health check endpoint in `src/index.ts`:
```typescript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
```

### Logging

Monitor logs on Render:
1. Go to your service dashboard
2. Click "Logs" tab
3. View real-time logs

### Performance

**Free Tier Limitations:**
- Render: Spins down after 15 min inactivity (first request takes ~30s)
- Railway: 500 hours/month free

**Upgrade for:**
- Always-on instances
- Custom domains
- Better performance
- More resources

---

## 🔐 Security Best Practices

### 1. Environment Variables

Never commit `.env` files:
```bash
# Ensure .gitignore includes:
.env
.env.local
.env.production
```

### 2. API Keys

Rotate keys regularly:
- GitHub Token: Every 90 days
- NVIDIA API Key: Every 90 days

### 3. HTTPS

Both Render and Railway provide automatic HTTPS.

### 4. Rate Limiting

Add rate limiting in production:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📈 Scaling

### When to Upgrade

Upgrade from free tier when:
- [ ] More than 100 users/day
- [ ] Response time > 3 seconds
- [ ] Frequent cold starts
- [ ] Need custom domain
- [ ] Require 99.9% uptime

### Upgrade Options

**Render:**
- Starter: $7/month (always-on)
- Standard: $25/month (better performance)

**Railway:**
- Hobby: $5/month (500 hours)
- Pro: $20/month (unlimited)

---

## ✅ Deployment Checklist

Before submitting to hackathon:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] All environment variables configured
- [ ] Health check endpoint working
- [ ] Test scan on public repository
- [ ] Test auto-fix generation
- [ ] Test PR creation
- [ ] Dashboard displays correctly
- [ ] PDF export works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] README updated with live demo link
- [ ] Screenshots taken
- [ ] Demo video recorded

---

## 🎥 Recording Demo Video

### Setup

1. **Clear browser cache**
2. **Open DevDriftGuard in incognito mode**
3. **Prepare test repository** (e.g., a small public repo with known issues)
4. **Use screen recording tool:**
   - Mac: QuickTime Player
   - Windows: Xbox Game Bar (Win + G)
   - Cross-platform: OBS Studio

### Script (2-3 minutes)

**0:00-0:15 - Introduction**
```
"Hi, I'm [Your Name], and this is DevDriftGuard - an AI-powered 
technical debt management system built with IBM Bob."
```

**0:15-0:45 - Scan Demo**
```
"Let me show you how it works. I'll scan this React repository.
DevDriftGuard uses IBM Bob to analyze the code and detect 
technical debt across 6 categories."
```
- Enter repo URL
- Click "Scan with Bob"
- Show real-time logs

**0:45-1:15 - Issue Review**
```
"Here are the results, ranked by our DCS algorithm - Debt Cost Score.
Each issue shows business impact, not just severity. This critical
security issue costs $2,400 per month in developer productivity."
```
- Click on high-DCS issue
- Show metrics grid
- Highlight ROI calculation

**1:15-1:45 - Auto-Fix**
```
"Now watch IBM Bob generate a production-ready fix with tests.
In just seconds, Bob writes the corrected code, comprehensive
tests, and a detailed PR description."
```
- Click "Auto-Fix with Bob"
- Show generated code
- Show tests

**1:45-2:15 - PR Creation**
```
"With one click, DevDriftGuard creates a pull request on GitHub.
The fix is ready to review and merge. This entire process took
less than 2 minutes."
```
- Click "Create PR"
- Show PR on GitHub

**2:15-2:30 - Dashboard & Closing**
```
"The dashboard shows executive metrics - total debt hours,
monthly costs, and ROI projections. DevDriftGuard transforms
technical debt from an invisible burden into a managed asset.
Thank you!"
```
- Show dashboard
- Show PDF export

### Tips

- **Keep it under 3 minutes**
- **Show real functionality** (not mockups)
- **Speak clearly and confidently**
- **Highlight IBM Bob integration**
- **Emphasize business value**
- **End with call-to-action**

---

## 📞 Support

If you encounter issues during deployment:

1. **Check Render/Railway status:** [status.render.com](https://status.render.com)
2. **Review logs** in your service dashboard
3. **Test locally first:** `npm run dev`
4. **GitHub Issues:** [Report deployment issues](https://github.com/yourusername/devdriftguard/issues)

---

## 🎉 Success!

Once deployed, your DevDriftGuard instance is ready for:
- Hackathon submission
- Live demos
- User testing
- Portfolio showcase

**Next Steps:**
1. Record demo video
2. Take screenshots
3. Update hackathon submission
4. Share with the world!

---

**Made with ❤️ for IBM Hackathon**