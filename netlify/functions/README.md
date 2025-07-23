# Netlify Functions Documentation

This directory contains Netlify serverless functions for the McDonald's Malaysia Frontend application.

## Functions

### 1. keep-alive.js (Scheduled Function)

**Purpose**: Automatically pings the Render server API every 14 minutes to prevent it from going to sleep due to inactivity on the free tier.

**Schedule**: Runs every 14 minutes using cron expression `*/14 * * * *`

**How it works**:
- Makes a GET request to the `/api/v1/locations` endpoint
- Logs the result to Netlify function logs
- Returns status 200 regardless of outcome to prevent Netlify from retrying

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: The API URL to ping (defaults to `https://mcdonalds-malaysia-api.onrender.com`)

### 2. ping-server.js (Manual Trigger Function)

**Purpose**: Manually trigger a ping to the server for testing purposes.

**Endpoint**: `/.netlify/functions/ping-server`

**How to test**:
```bash
# Test locally (if running netlify dev)
curl http://localhost:8888/.netlify/functions/ping-server

# Test on production
curl https://your-netlify-site.netlify.app/.netlify/functions/ping-server
```

**Response Example**:
```json
{
  "success": true,
  "message": "Server ping successful",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "serverStatus": 200,
  "responseTime": "245ms",
  "apiUrl": "https://mcdonalds-malaysia-api.onrender.com"
}
```

## Monitoring

You can monitor the scheduled function execution in:
1. Netlify Dashboard → Functions → keep-alive → View logs
2. Check for any errors or successful pings
3. The function will log each ping attempt with timestamp

## Important Notes

- The scheduled function runs on Netlify's infrastructure, not on your local machine
- Render free tier servers sleep after 15 minutes of inactivity, so the 14-minute interval ensures the server stays awake
- The function continues to run even if the ping fails, preventing retry loops
- CORS is enabled on the manual ping function for browser testing

## Deployment

These functions are automatically deployed when you push to your repository and Netlify builds your site. No additional configuration is needed beyond having the functions in the `netlify/functions` directory.