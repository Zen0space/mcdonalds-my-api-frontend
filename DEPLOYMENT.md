# Netlify Deployment Guide

This guide will walk you through deploying the McDonald's Malaysia frontend application to Netlify.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Node.js** (v18 or higher) installed
2. **npm** or **yarn** package manager
3. A **Netlify account** (free tier is sufficient)
4. The frontend code with all dependencies installed
5. The backend API already deployed (https://mcdonalds-malaysia-api.onrender.com)

## 🚀 Quick Start

The fastest way to deploy:

1. Push your code to GitHub
2. Login to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Netlify will auto-detect Next.js settings
6. Deploy!

## 📦 Pre-Deployment Setup

### 1. Install Dependencies

```bash
cd geolocation-mcd-frontend
npm install
```

### 2. Set Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://mcdonalds-malaysia-api.onrender.com
```

### 3. Test Build Locally

```bash
npm run build
```

Ensure the build completes without errors.

### 4. Test Connection

```bash
npm run dev
```

Open http://localhost:3000 and verify the API connection works.

## 🔧 Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Login to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Authorize Netlify to access your GitHub
   - Select your repository
   - Netlify auto-detects Next.js configuration

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy site"

### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Project**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   # Deploy to draft URL
   netlify deploy

   # Deploy to production
   netlify deploy --prod
   ```

### Method 3: Drag & Drop

1. **Build Project**
   ```bash
   npm run build
   ```

2. **Create Deploy Folder**
   ```bash
   cp -r .next netlify-deploy
   cp netlify.toml netlify-deploy/
   ```

3. **Upload to Netlify**
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Drag the `netlify-deploy` folder
   - Your site is live!

## 🔐 Environment Variables

### Setting Environment Variables in Netlify

1. Go to your site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add the following:

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_API_URL | https://mcdonalds-malaysia-api.onrender.com |
| NODE_VERSION | 18 |

### Important Notes:
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Never store sensitive data in `NEXT_PUBLIC_` variables
- Changes require redeployment to take effect

## 📝 Configuration Details

### netlify.toml Configuration

The `netlify.toml` file configures:

- **Build settings**: Node version, build command
- **Environment variables**: API URL
- **Headers**: Security and caching
- **Redirects**: API proxy and routing
- **Plugins**: Next.js integration

### Next.js on Netlify

Netlify automatically:
- Detects Next.js framework
- Configures serverless functions
- Sets up image optimization
- Handles ISR (Incremental Static Regeneration)

## 🧪 Post-Deployment Testing

### 1. Verify Deployment

After deployment, you'll get a URL like: `https://amazing-site-123.netlify.app`

### 2. Test API Connection

Open browser console and run:

```javascript
// Test API connection
fetch('https://your-site.netlify.app/api/health')
  .then(res => res.json())
  .then(data => console.log('API Status:', data))
```

### 3. Check All Pages

Test critical paths:
- [ ] Homepage loads
- [ ] Chat interface works
- [ ] Map displays correctly
- [ ] Search functionality
- [ ] Location services

### 4. Monitor Performance

Use Netlify Analytics or browser DevTools:
- Page load time
- API response times
- Bundle size
- Error logs

## 🎯 Production Checklist

Before going live:

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] API connection verified
- [ ] Error pages configured
- [ ] Analytics/monitoring setup
- [ ] Performance optimized
- [ ] SEO meta tags added

## 🌐 Custom Domain Setup

### Adding a Custom Domain

1. **In Netlify Dashboard**:
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Enter your domain (e.g., `mcdonalds-locator.com`)

2. **DNS Configuration**:
   - Add Netlify's nameservers to your domain registrar
   - Or use CNAME/A records:
     ```
     Type: CNAME
     Name: www
     Value: amazing-site-123.netlify.app
     ```

3. **SSL Certificate**:
   - Netlify provides free SSL
   - Automatic renewal
   - Force HTTPS in settings

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and retry
   npm clean-install
   npm run build
   ```

2. **API Connection Errors**
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Check CORS settings on backend
   - Test API directly: https://mcdonalds-malaysia-api.onrender.com/health

3. **404 Errors on Routes**
   - Ensure `netlify.toml` has proper redirects
   - Check Next.js routing configuration

4. **Slow Initial Load**
   - Normal for Render free tier (cold starts)
   - Consider showing loading states
   - Implement proper error handling

### Debug Commands

```bash
# Check Netlify CLI version
netlify --version

# View site info
netlify status

# Open site dashboard
netlify open

# View deployment logs
netlify deploy --debug
```

## 📊 Monitoring & Maintenance

### Netlify Features

1. **Deploy Previews**
   - Automatic previews for pull requests
   - Test changes before merging

2. **Split Testing**
   - A/B test different branches
   - Gradual rollouts

3. **Analytics**
   - Page views
   - Bandwidth usage
   - Performance metrics

4. **Forms**
   - Built-in form handling
   - Spam protection
   - Email notifications

### Keeping Up to Date

1. **Dependency Updates**
   ```bash
   npm update
   npm audit fix
   ```

2. **Netlify Plugin Updates**
   - Check Netlify dashboard for plugin updates
   - Update `netlify.toml` as needed

3. **Monitor Performance**
   - Use Lighthouse CI
   - Set up alerts for downtime
   - Track Core Web Vitals

## 🆘 Getting Help

### Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)
- [Netlify Support Forum](https://answers.netlify.com)
- [Netlify Status Page](https://www.netlifystatus.com)

### Support Channels

1. **Netlify Community Forum**
2. **GitHub Issues** (for code problems)
3. **Netlify Support** (for account issues)

## 🎉 Deployment Complete!

Your McDonald's Malaysia frontend is now live on Netlify!

### Next Steps:

1. Set up monitoring and alerts
2. Configure custom domain
3. Implement CI/CD pipeline
4. Add performance monitoring
5. Set up error tracking (e.g., Sentry)

### Quick Commands Reference

```bash
# Deploy to production
netlify deploy --prod

# Open site
netlify open:site

# View logs
netlify logs:function

# Check environment variables
netlify env:list

# Link to existing site
netlify link
```

---

**Remember**: The backend API on Render free tier may sleep after 15 minutes of inactivity. First requests might take 30+ seconds. Implement proper loading states and user feedback for the best experience.