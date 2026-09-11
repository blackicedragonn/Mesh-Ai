# Deploying MeshAI to AWS EC2

## Overview
Production deploy uses Docker Compose on an EC2 instance (Ubuntu) with Caddy as the reverse proxy on port 80.

## Prerequisites
- AWS account (Free Tier)
- EC2 key pair (`.pem`)
- Security group allowing inbound TCP 22, 80, and 443

## Steps

1. Launch an Ubuntu 22.04/24.04 Free Tier EC2 instance (e.g. `t2.micro` / `t3.micro`).
2. SSH in: `ssh -i your-key.pem ubuntu@<PUBLIC_IP>`
3. Install Docker Engine + Compose plugin.
4. Copy this repo to the instance (or `git clone`).
5. Create a root `.env` from `.env.example`:
   - `MONGO_URI=mongodb://mongo:27017/meshai`
   - `JWT_SECRET=<strong secret>`
   - `NEBIUS_API_KEY=<your key>`
   - `SITE_ADDRESS=<PUBLIC_IP>` (no `http://` prefix)
6. From the repo root: `sudo docker compose up --build -d`
7. Open `http://<PUBLIC_IP>/` — health check: `http://<PUBLIC_IP>/health`

## Notes
- This Caddyfile serves HTTP on the public IP (`auto_https off`) so the app works without a custom domain.
- Prefer an Elastic IP if you stop/start the instance, then update `SITE_ADDRESS` and restart Caddy.
- Optional: attach a domain later and re-enable Caddy automatic HTTPS.

## Live
http://54.90.197.159
