# SCDProject25 - Node + Mongo Dockerized Application

## Description
This project demonstrates a Node.js backend connected to MongoDB, deployed using Docker and Docker Compose.
It covers manual Docker setup, networking, environment variables, volumes, and Docker Compose orchestration.

---

## Project Structure
SCDProject25/
├─ Dockerfile # Backend Dockerfile
├─ docker-compose.yml # Compose file to run backend + Mongo
├─ .env # Environment variables (optional)
├─ main.js / app.js # Node backend
├─ package.json
└─ README.md

---

## Requirements
- Docker >= 20.x
- Docker Compose >= 2.x
- Node.js (for local development, optional)

---

## Setup & Running

### 1. Build & Run using Docker Compose
```bash
# Build and start containers in detached mode
docker-compose up -d --build

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f nodeapp
