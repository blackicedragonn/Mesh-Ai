# MeshAI

A full-stack AI knowledge assistant. Users create an account, upload documents to a personal knowledge base, and ask questions about them through a chat interface. Answers are generated with retrieval-augmented generation (RAG): relevant chunks are retrieved from the uploaded documents and passed to an LLM to ground its response.

**Live:** <https://your-meshai-subdomain.example.com> _(replace with your actual deployed subdomain)_

## Tech stack

- React + TypeScript (Vite, React Router)
- Express + TypeScript (Mongoose)
- MongoDB
- JWT-based authentication
- Nebius AI (OpenAI-compatible API) for embeddings and chat completions
- Docker + Docker Compose
- Caddy (reverse proxy, automatic HTTPS)
- AWS EC2
- GitHub Actions (CI)

## Getting started locally

Prerequisites: Node.js 20+, Docker

There are two ways to run the project locally — plain Node for day-to-day development, or the full Docker stack to mirror production.

### Option A: Local development (Node, no Docker)

1. Clone the repository and `cd` into it.
2. Install all dependencies from the root: `npm run install:all`.
3. In `server/`, copy `.env.example` to `.env` and fill in the required values (see below).
4. Start both the frontend and backend together from the root: `npm run dev`.

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on `http://localhost:3000`.

### Option B: Full Docker stack

1. Clone the repository and `cd` into it.
2. Copy `.env.example` to `.env` at the project root and fill in the required values (see below).
3. Run `docker compose up --build`.

This builds and starts the frontend, backend, MongoDB, and Caddy together. The app is served at `http://localhost`.

## Required environment variables

The project uses two separate `.env` files, since local development and the Docker stack need slightly different values (for example, the Docker stack connects to MongoDB by service name, not `localhost`).

**`server/.env`** (local development only):

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign authentication tokens |
| `NEBIUS_API_KEY` | API key for the Nebius AI service |
| `PORT` | Port the backend listens on locally |

**`.env`** at the project root (Docker Compose only):

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign authentication tokens (use a different value in production than in development) |
| `NEBIUS_API_KEY` | API key for the Nebius AI service |
| `SITE_ADDRESS` | Domain Caddy listens on and issues an HTTPS certificate for. Use `localhost` for local Docker use, or your real subdomain in production |

Do not commit either `.env` file — copy the corresponding `.env.example` and fill in real values locally.

## Project Pitch Video

Check out this video, where I describe my project and some challenges I faced while building it: _(add your Google Drive link here)_
