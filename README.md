# BigO.ai: AI-Powered Code Complexity Analyzer & Interactive Simulator

BigO.ai is a professional developer portfolio application designed to calculate, optimize, and visually simulate the time and space complexity of algorithms. Built with a premium, responsive glassmorphism UI, the app supports dynamic AI analysis powered by Google Gemini, real-time visual code tracing, cross-language compilation, and an admin analytics dashboard.

---

## 🚀 Key Features

### 1. **Time & Space Complexity Analyzer**
- Instantly estimates time and space complexity in Big-O notation ($O(1)$, $O(N)$, $O(N^2)$, $O(2^N)$, etc.).
- Utilizes the **Google Gemini API** for live semantic code parsing.
- Provides a detailed explanation of performance bottlenecks and recommended optimization strategies.
- Operates on a local regex-based analyzer fallback when offline or when no API key is provided.

### 2. **Step-by-Step Code Execution Simulator**
- Traces variables and dry-runs algorithms line-by-line.
- Interactive code editor panel highlighting the active executing line and highlighting active rows in the line numbers gutter.
- Smooth auto-scrolling to center the executing line during execution.
- Generates dynamic dry-run quizzes at key execution stages to test user comprehension.

### 3. **Line-by-Line Heatmap Gutter**
- Visually flags high-intensity execution paths in the editor gutter (e.g. green for low execution counts, yellow for medium loops, red for nested loop bottlenecks).

### 4. **AI-Powered Code Translator**
- Seamlessly converts code structures across 6 major languages: JavaScript, Python, C++, Java, C, and Rust.

### 5. **User Tiers & Subscription System**
- **Anonymous Tier**: Basic template analysis.
- **Free Tier** (Logged In): Allows custom code analysis, saves up to 20 code history logs, and includes local history search.
- **Paid Premium Tier**: Unlocks the Step-by-Step Simulator, custom line-by-line heatmap, larger history logs (up to 30 logs), and provides 70 simulation tokens.
- **Simulated Payment Gateway**: Seamlessly upgrade or buy token packages with dynamic tax receipts/invoices available for download.

### 6. **Feedback System & Admin Dashboard**
- Real-time feedback submission panel storing name, email, time, and custom feedback message.
- Secure developer admin panel to view, filter, and delete user feedback logs or adjust user tiers on the fly.

### 7. **Sleek Aesthetic Design**
- Fully responsive dark/light themes.
- Vibrant hover styles: **neon cyan-blue border and glow shadows** in Dark Theme, and **royal indigo border and shadows** in Light Theme.

---

## 🛠️ Technology Stack

### Frontend (`/frontend`)
- **Core Framework**: React 19 (Functional components, hooks, global context state lifecycle)
- **Bundler & Build Tool**: Vite 8+
- **Styling**: Tailwind CSS v4 & custom premium glassmorphism variables
- **HTTP Client**: Axios with automatic JWT header interceptors
- **Icons**: Lucide React
- **Service Integration**: Google Gemini API client
- **Testing**: Vitest + JSDOM

### Backend (`/backend`)
- **Runtime**: Node.js & Express.js (ES Modules syntax)
- **Database**: MongoDB & Mongoose (ODM)
- **Auth**: Stateless JSON Web Tokens (JWT) with bcrypt password hashing
- **Security**: Helmet, CORS configurations
- **OTP Mailer**: Nodemailer with Gmail SMTP credentials
- **Serverless Adapter**: Adapted for Vercel Serverless Functions

---

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and a MongoDB instance (or Atlas account) ready.

### Installation & Execution

#### 1. Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
   Add your `MONGO_URI`, `JWT_SECRET`, and optional Gmail credentials for real OTP dispatching.
4. Run in development mode:
   ```bash
   npm run dev
   ```
   The backend server starts at [http://localhost:5000](http://localhost:5000).

#### 2. Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
   The client starts at [http://localhost:5173](http://localhost:5173).

---

## 🏗️ Architecture & Folder Design

- **`frontend/src/App.jsx`**: Central React coordinator managing active tabs, editor configurations, and modal render variables.
- **`frontend/src/context/AuthContext.jsx`**: Global authentication and checkout transaction logic communicating with the backend.
- **`frontend/src/api/client.js`**: Axios client configured with base URL and JWT token headers.
- **`frontend/src/components/EditorPanel.jsx`**: Code editor with gutter highlighting, execution tracing, and heatmap overlays.
- **`frontend/src/components/SimulatorPanel.jsx`**: Handles logic simulations, step controls, variables watch tables, and quizzes.
- **`backend/api/index.js`**: Main API server entry point for local execution and Vercel Serverless routing.
- **`backend/routes/`**: Handles authentication verification, history logs storage, feedback, and billing operations.
