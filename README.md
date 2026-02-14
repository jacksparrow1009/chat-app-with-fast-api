# 🚀 Full-Stack Real-Time Chat Engine

A high-performance, real-time chat application featuring a **Next.js 15** frontend and a **FastAPI** backend. This monorepo architecture demonstrates modern full-stack development practices, including asynchronous Python, WebSocket communication, cloud database integration with **Neon (PostgreSQL)**, and a polished **Shadcn UI** design.



## 🏗️ Architecture Overview

The project is structured as a monorepo to ensure seamless integration between the client and server while maintaining strict environment isolation.

* **`/frontend`**: Built with Next.js 15 (App Router), leveraging Tailwind CSS and Shadcn UI for a premium user experience.
* **`/backend`**: Powered by FastAPI and SQLAlchemy, utilizing WebSockets for low-latency communication and Alembic for database migrations.
* **Database**: PostgreSQL hosted on Neon.tech, optimized for serverless scaling and high availability.

## ✨ Key Features

- **Real-Time Messaging**: Bi-directional communication using WebSockets.
- **Persistent Storage**: All chat history and user data are persisted in a PostgreSQL database.
- **Modern Auth UI**: Polished Login and Sign-up flows built with React Hook Form and Zod validation.
- **Database Migrations**: Version-controlled database schema management using Alembic.
- **AI-Ready**: The message schema is architected to support future integration with LLM agents.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Form Management**: React Hook Form
- **Validation**: Zod

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Real-time**: Python WebSockets

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- A Neon.tech PostgreSQL account

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate

pip install -r requirements.txt
# Create a .env file with DATABASE_URL
alembic upgrade head
python -m uvicorn main:app --reload

```

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev

```


### 📈 Roadmap & Future Enhancements

[ ] AI Integration: Implementing FastAPI-based LLM agents for automated chat assistance.

[ ] JWT Authentication: Full secure session management.

[ ] File Sharing: Support for image and document uploads via S3.

[ ] Dockerization: Containerizing the stack for production-ready deployment.
