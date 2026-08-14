# 🚀 BigO.ai — Production Deployment Guide

This guide provides step-by-step instructions to deploy **BigO.ai** as a unified full-stack monorepo web app on **Vercel** with a free **MongoDB Atlas** database and Google **Gemini AI** integration.

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. A **GitHub** account.
2. A **Vercel** account (sign up at [vercel.com](https://vercel.com)).
3. A free **MongoDB Atlas** account ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)).
4. A **Google Gemini API Key** ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)).
5. A **Gmail App Password** for sending real OTP emails ([support.google.com/accounts/answer/185833](https://support.google.com/accounts/answer/185833)).

---

## 🛠️ Step 1: Set Up MongoDB Atlas Database

1. Log into **MongoDB Atlas** and create a free **M0 Cluster**.
2. Under **Database Access**, create a database user (e.g. `bigo_user`) and password.
3. Under **Network Access**, click **Add IP Address** → Select **Allow Access From Anywhere (`0.0.0.0/0`)** so Vercel Serverless functions can connect.
4. Click **Connect** → **Drivers** → Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/bigodb?retryWrites=true&w=majority
   ```

---

## 🔑 Step 2: Generate Gmail App Password for OTP Emails

1. Enable **2-Step Verification** on your Google Account.
2. Go to **Google Account Settings** → **Security** → **App Passwords**.
3. Create a new App Password named `BigO.ai`.
4. Copy the generated 16-character password (e.g. `abcd efgh ijkl mnop`).

---

## ⚙️ Step 3: Deploy to Vercel

1. Push your repository to GitHub.
2. Log into [Vercel Dashboard](https://vercel.com/dashboard) → Click **Add New Project** → Import your GitHub repository `complexity-analyzer`.
3. In Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
4. Expand **Environment Variables** and add the following keys:

| Key | Value Example | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster0.../bigodb` | MongoDB Atlas URI |
| `JWT_SECRET` | `your-secure-random-jwt-secret-9941` | Secret key for JWT auth |
| `EMAIL_USER` | `your-email@gmail.com` | Gmail address sending OTPs |
| `EMAIL_PASS` | `abcd efgh ijkl mnop` | Gmail 16-char App Password |
| `ADMIN_EMAIL` | `your-email@gmail.com` | Admin email address |
| `FRONTEND_URL` | `https://your-project.vercel.app` | Production app URL |
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | Gemini API Key |

5. Click **Deploy**. Vercel will build the frontend SPA and provision the backend Node.js Serverless Functions automatically.

---

## 🧪 Step 4: Verify Production Deployment

Once Vercel completes deployment:
1. Open your production domain: `https://your-project.vercel.app`.
2. Check the API health endpoint: `https://your-project.vercel.app/api/health`.
3. Test **OTP Login**: Enter your email address → Check your inbox for the 4-digit code → Log in.
4. Test **AI Analysis**: Run "Analyze Complexity" on a custom code snippet.
5. Test **Shareable Link**: Click "Share Link" on the Complexity result → Open link in incognito tab.

---

## 🏆 Resume & Portfolio Presentation Tips

When showcasing BigO.ai on your resume or portfolio:
- **Project Title**: BigO.ai — Full-Stack AI Code Complexity Analyzer & Step Simulator
- **Live Demo**: `https://your-project.vercel.app`
- **Tech Stack**: React 19, Node.js, Express, MongoDB Atlas, Tailwind CSS v4, Google Gemini AI, Nodemailer, Vercel Serverless.
- **Key Bullet Points**:
  - Engineered an interactive code complexity analyzer powered by Google Gemini 2.0 Flash with a local regex failover mechanism.
  - Implemented line-by-line step execution visualizer with real-time variable tracing and interactive dry-run quizzes.
  - Designed stateless JWT authentication with Nodemailer Gmail SMTP 2FA OTP verification and role-based access control.
  - Deployed on Vercel Serverless monorepo architecture with Mongoose connection caching and MongoDB Atlas TTL indexed collections.
