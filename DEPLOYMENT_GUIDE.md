# Deploy Bid2Code to Render

This guide will help you deploy your Bid2Code application to Render.

## Prerequisites

1. A [Render account](https://render.com/)
2. A [NeonDB](https://neon.tech/) PostgreSQL database (or any PostgreSQL provider)
3. Git installed on your machine

## Step 1: Prepare Your Repository

### Option A: Deploy from GitHub/GitLab (Recommended)

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Bid2Code app"
   ```

2. **Create a new repository on GitHub/GitLab**

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bid2code.git
   git branch -M main
   git push -u origin main
   ```

### Option B: Deploy Directly on Render

You can also deploy directly without Git, but using Git is recommended for easier updates.

## Step 2: Set Up Database

Your app uses NeonDB (already configured in `.env`). Make sure:

1. Your NeonDB database is accessible from anywhere (add `0.0.0.0/0` to IP allowlist)
2. You have the connection string ready

**Alternative:** Create a new PostgreSQL database on Render or another provider.

## Step 3: Deploy to Render

### Method 1: Using render.yaml (Recommended)

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Blueprint"**

3. **Connect your Git repository**

4. **Select the repository containing your code**

5. **Render will automatically detect `render.yaml`** and show the configuration

6. **Configure environment variables:**
   - Click on the `bid2code` service
   - Go to "Environment" tab
   - Add these variables:
     ```
     DATABASE_URL=your_neondb_connection_string
     ADMIN_USERNAME=msec
     ADMIN_PASSWORD=Msec@123
     ADMIN_NAME=Administrator
     SESSION_SECRET=your_random_secret_here_change_in_production
     ```

7. **Click "Apply"**

8. **Wait for deployment** (takes 2-5 minutes)

9. **Get your live URL** (e.g., `https://bid2code-xyz.onrender.com`)

### Method 2: Manual Deployment

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Web Service"**

3. **Connect your repository**

4. **Fill in the details:**
   - **Name:** `bid2code`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** (leave blank)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server/server.js`

5. **Choose Plan:**
   - **Starter** (free tier available) or **Standard** for production

6. **Click "Advanced" and add environment variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=your_neondb_connection_string
   ADMIN_USERNAME=msec
   ADMIN_PASSWORD=Msec@123
   ADMIN_NAME=Administrator
   SESSION_SECRET=your_random_secret_here_change_in_production
   ```

7. **Click "Create Web Service"**

8. **Wait for deployment**

## Step 4: Configure CORS for Production

Update your deployed app to allow your production domain:

The app already has flexible CORS for localhost. For production, it will automatically work with Render's domain.

If you want to customize, edit `server/server.js`:

```javascript
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // Allow localhost for development
        if (origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1) {
            return callback(null, true);
        }
        
        // Allow your Render domain
        if (origin.indexOf('onrender.com') !== -1) {
            return callback(null, true);
        }
        
        // Block other origins
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Step 5: Update Admin Login Credentials

After deployment, you can change admin credentials by updating environment variables in Render dashboard:

1. Go to your service in Render dashboard
2. Click "Environment" tab
3. Update `ADMIN_USERNAME` and `ADMIN_PASSWORD`
4. Click "Save Changes"
5. Service will automatically restart with new credentials

## Step 6: Test Your Deployment

1. **Visit your live URL:** `https://bid2code-xyz.onrender.com`

2. **Test admin login:**
   - Go to: `https://bid2code-xyz.onrender.com/admin/login`
   - Username: `msec` (or your custom username)
   - Password: `Msec@123` (or your custom password)

3. **Test team signup/login**

4. **Test all features:**
   - Create questions
   - Live bidding
   - Team dashboard

## Step 7: Enable Auto-Deploy (Optional)

Render automatically deploys when you push to your connected branch.

To enable:
1. Go to your service in Render
2. Settings are auto-configured from `render.yaml`
3. Any push to `main` branch triggers deployment

## Troubleshooting

### Issue: App won't start

**Check logs in Render dashboard:**
1. Go to your service
2. Click "Logs" tab
3. Look for errors

**Common issues:**
- Missing environment variables
- Database connection string incorrect
- PORT not set (should be 3000)

### Issue: Database connection fails

**Solutions:**
1. Verify DATABASE_URL is correct
2. Check NeonDB allows connections from Render IPs
3. Add `?sslmode=require` to connection string if needed

### Issue: Sessions not working

**Solutions:**
1. Make sure SESSION_SECRET is set
2. Check browser console for cookie errors
3. Ensure HTTPS is enabled (Render does this automatically)

### Issue: CORS errors

**Solutions:**
1. Check your frontend is calling the correct Render URL
2. Verify CORS configuration includes `onrender.com`
3. Clear browser cache and cookies

## Security Best Practices

1. **Change default admin credentials** immediately after deployment
2. **Use a strong SESSION_SECRET** (at least 32 random characters)
3. **Enable HTTPS** (automatic on Render)
4. **Keep dependencies updated** (`npm audit fix`)
5. **Monitor logs regularly**
6. **Set up database backups**

## Updating Your App

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Update feature"
git push origin main
```

Render will automatically deploy the changes (takes 1-2 minutes).

## Scaling

When your app grows:

1. **Upgrade Render plan** for more resources
2. **Use connection pooling** for database
3. **Add Redis** for session management (optional)
4. **Enable CDN** for static assets (optional)

## Cost Estimate

- **Render Starter Plan:** Free (with limitations) or $7/month
- **Standard Plan:** $25/month (recommended for production)
- **NeonDB:** Free tier available
- **Total:** $0-25/month depending on usage

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [NeonDB Documentation](https://neon.tech/docs)

## Next Steps After Deployment

1. Share your live URL with teams
2. Monitor usage and performance
3. Set up monitoring/alerts if needed
4. Consider adding email notifications
5. Add analytics tracking (optional)

---

**Need Help?** Check the logs in Render dashboard or contact Render support.
