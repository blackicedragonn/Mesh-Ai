# Deploying MeshAI to Render

## Prerequisites
- GitHub account with your repo pushed
- Render account (free at https://render.com)
- Nebius AI API key
- Strong JWT secret (min 32 characters)

## Steps

### 1. Create a Render Account & Connect GitHub
1. Go to https://render.com and sign up
2. Click "New +" → "Blueprint"
3. Select your repository
4. Render will auto-detect `render.yaml`

### 2. Configure Environment Variables
In the Render dashboard, set:
- `JWT_SECRET` — generate a strong random string (min 32 chars): `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `NEBIUS_API_KEY` — your Nebius API key

MongoDB is auto-provisioned from `render.yaml` and automatically linked.

### 3. Deploy
Click "Deploy" and wait 3-5 minutes. Render will:
1. Build the backend (Express + TypeScript)
2. Build the frontend (React + Vite)
3. Provision a free MongoDB instance
4. Deploy both services

### 4. Get Your Live URL
Once deployed, Render assigns a URL like `https://meshai-XXXX.onrender.com`

### 5. Update README
Replace the **Live** link in your README with your actual Render URL.

## Important Notes

**Free tier limits:**
- Services spin down after 15 minutes of inactivity (slow first request)
- 0.5 GB RAM per service (sufficient for demo)
- MongoDB limited to 512 MB

**For production:**
- Upgrade to paid plans
- Use a custom domain (Settings → Domains)
- Enable automatic deploys on GitHub push

## Troubleshooting

**Backend won't start:**
```bash
# Check logs in Render dashboard
# Common issues: missing NEBIUS_API_KEY, MongoDB connection timeout
```

**Frontend shows blank page:**
- Check browser console for API errors
- Verify backend URL is correct (auto-set by Render)

**MongoDB won't connect:**
- Wait 2-3 minutes for database to initialize
- Check connection string in Render dashboard

---

Once live, update your README and resubmit to TripleTen.
