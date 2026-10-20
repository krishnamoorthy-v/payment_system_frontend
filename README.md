# Payment Gateway Frontend (React + Vite + TypeScript)

This is the client-side checkout and payment UI for the Razorpay Payment Gateway, powered by the FastAPI backend.

## 🚀 Quick Start

1. Start the FastAPI backend first (in `../payment_gateway`):
   ```bash
   cd ../payment_gateway
   .venv/bin/uvicorn main:app --reload --port 8000
   ```

2. Start the Vite dev server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

## 🛠 Available Scripts

- `npm run dev`: Starts the local Vite development server with proxy to `http://127.0.0.1:8000`
- `npm run build`: Type-checks and builds the production bundle in `dist/`
- `npm run lint`: Runs ESLint over the project
- `npm run preview`: Previews the production build locally

## 📦 Tech Stack
- **React 19**
- **Vite 8**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (Icons)
- **Razorpay Standard Checkout SDK**
