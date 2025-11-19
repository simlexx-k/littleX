# LittleX: A Minimalistic Social Media Platform Prototype

LittleX is a lightweight social media application developed using the **Jaseci Stack**. It serves as a demonstration of how Jaseci Stack can be utilized to build scalable and intelligent applications.

## **About LittleX**

LittleX is a minimalistic implementation of a **social media platform** that showcases the capabilities of the Jaseci Stack. It includes features such as:

1. **User Profiles**:
   - Create and manage user accounts.
   - Follow other users and track relationships.

2. **Tweets**:
   - Post, view, and interact with tweets.

3. **Comments and Likes**:
   - Engage with tweets through comments and likes.

4. **AI-Powered Features**:
   - Utilizes **MTLLM** for GPT-4o summarization and SentenceTransformer for semantic search, enhancing user interactions.

5. **Cloud Deployment**:
   - Deploy workflows, walkers, and AI features to **Jac Cloud** for seamless scaling and execution.

## **LittleX Architecture**

![Architecture](Documentation/images/Architecture.png)


## **Running LittleX on Local Environment**

### 1. Clone the Repository

Start by cloning the **LittleX** repository to your local system:

```bash
git clone https://github.com/Jaseci-Labs/littleX.git
cd littlex
```
### 2. Install Dependencies
```bash
pip install -r littleX_BE/requirements.txt
```

### 3. Start the Backend Server
```bash
jac serve littleX_BE/littleX.jac
```
### 4. Run the Frontend Server
Open another command line
```bash
cd littleX_FE
npm i
npm run dev
```
### 5. Run the stack with Docker Compose
If you prefer to host the backend (and its dependencies) in Docker, build the `littleX_BE` image and start MongoDB plus Cloudflare Tunnel with:
```bash
docker compose up --build
```

Before running the stack, copy `.env.example` to `.env` and update any secrets (especially `CLOUDFLARED_TUNNEL_TOKEN`). Docker Compose automatically loads `.env`, so the services will pick up the same credentials.

- Backend: exposed on `http://localhost:8000`.
- MongoDB: runs in the same network, configured via `DATABASE_HOST` (the default points at `mongodb://littlex:littlex@mongodb:27017`) and stores data in a persistent volume.
- Mongo Express: available at `http://localhost:8081` so you can browse the Mongo data (truthy service is authenticated with the same credentials as Mongo’s root user).
- Cloudflared: reads `CLOUDFLARED_TUNNEL_TOKEN` from `.env` and runs `cloudflared tunnel --no-autoupdate run --token <token>` to expose the backend.
