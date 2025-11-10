# Monorepo Deployment Guide: Vercel & Render

This guide provides instructions for deploying the three components of this monorepo.

**Deployment Options:**

*   **Option 1 (Recommended for simplicity):** Deploy both the frontend and backend to Vercel, and the AI service to Render.
*   **Option 2:** Deploy the frontend to Vercel, and the backend and AI service to Render.

---

## Part 1: Deploying the Frontend (Next.js) to Vercel

Vercel is the recommended platform for deploying Next.js applications.

### 1.1. Project Setup

1.  **Sign up or Log in** to your [Vercel](https://vercel.com) account.
2.  **Connect your Git repository** (GitHub, GitLab, or Bitbucket) to Vercel.
3.  **Import the Project:**
    *   When prompted, select your monorepo repository.
    *   Vercel will automatically detect the Next.js application within the `apps/web` directory.

### 1.2. Configure the Project

*   **Framework Preset:** `Next.js`.
*   **Root Directory:** `apps/web`.
*   **Build Command:** `pnpm build`.
*   **Install Command:** `pnpm install`.

### 1.3. Environment Variables

*   **If using Vercel for the backend (Option 1):**
    *   `NEXT_PUBLIC_API_BASE`: `/api` (This will be a relative path to your backend).
*   **If using Render for the backend (Option 2):**
    *   `NEXT_PUBLIC_API_BASE`: The URL of your deployed `api` service on Render (e.g., `https://your-api-service.onrender.com/api`).

### 1.4. Deploy

Click the **Deploy** button.

---

## Part 2 (Option 1): Deploying the Backend (Node.js) to Vercel

This is the recommended option for simplicity.

### 2.1. Project Setup

When you import your monorepo to Vercel, it might only detect the frontend. You may need to add the backend as a second project.

1.  From your Vercel dashboard, **add a new project** and select the same repository.
2.  **Configure the project:**
    *   **Framework Preset:** `Other`.
    *   **Root Directory:** `apps/api`.
    *   **Build Command:** `pnpm install && pnpm build && pnpm db:push`.
    *   **Install Command:** `pnpm install`.

### 2.2. Environment Variables

*   `DATABASE_URL`: The connection string for your PostgreSQL database.
*   `VANNA_API_BASE_URL`: The URL of your deployed Vanna AI service on Render.
*   `CORS_ORIGIN`: The URL of your deployed frontend on Vercel (e.g., `https://your-web-app.vercel.app`).

### 2.3. Deploy

Click the **Deploy** button.

---

## Part 2 (Option 2): Deploying the Backend (Node.js) to Render

This option is good if you prefer to keep your backend services on the same platform.

### 2.1. Prepare the Backend for Production

Before deploying, you need to add `build` and `start` scripts to `apps/api/package.json`.

1.  **Open `apps/api/package.json`** and add the following scripts to the `"scripts"` section:

    ```json
    "scripts": {
      "build": "tsc",
      "start": "node dist/index.js",
      // ... keep existing scripts
    },
    ```

2.  **Commit and push** this change to your Git repository.

### 2.2. Service Setup

1.  **Sign up or Log in** to your [Render](https://render.com) account.
2.  **Create a new "Web Service"**.
3.  **Connect your Git repository**.
4.  **Configure the service:**
    *   **Name:** A descriptive name (e.g., `my-app-api`).
    *   **Environment:** `Node`.
    *   **Root Directory:** `apps/api`.
    *   **Build Command:** `pnpm install && pnpm build && pnpm db:push`.
    *   **Start Command:** `pnpm start`.

### 2.3. Environment Variables

*   `DATABASE_URL`: The connection string for your PostgreSQL database.
*   `VANNA_API_BASE_URL`: The URL of your deployed Vanna AI service on Render.
*   `CORS_ORIGIN`: The URL of your deployed frontend on Vercel (e.g., `https://your-web-app.vercel.app`).

### 2.4. Deploy

Click the **Create Web Service** button.

---

## Part 3: Deploying the AI Service (Python) to Render

This part is the same for both options.

### 3.1. Service Setup

1.  **Create another new "Web Service"** on Render.
2.  **Connect your Git repository**.
3.  **Configure the service:**
    *   **Name:** A descriptive name (e.g., `my-app-vanna`).
    *   **Environment:** `Python`.
    *   **Root Directory:** `services/vanna`.
    *   **Build Command:** `pip install -r requirements.txt`.
    *   **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`.

### 3.2. Environment Variables

*   `DATABASE_URL`: The same PostgreSQL connection string.
*   `GROQ_API_KEY`: Your API key for the Groq service.
*   `GROQ_MODEL`: The Groq model you wish to use.

### 3.3. Deploy

Click the **Create Web Service** button.

---

## Security Precautions

When deploying your application to production, it's crucial to take the following security precautions:

### CORS Configuration

Cross-Origin Resource Sharing (CORS) is a security feature that restricts which domains can access your API. In the backend `api` application, the CORS origin is controlled by the `CORS_ORIGIN` environment variable.

*   **For production, you must set `CORS_ORIGIN` to the exact URL of your deployed frontend** (e.g., `https://your-app-name.vercel.app`). This will prevent other websites from making requests to your API.

### Secure Environment Variables

*   **Never hardcode secrets** like API keys, database URLs, or other sensitive information directly in your code.
*   Use the environment variable settings provided by Vercel and Render to store these secrets securely.

### Database Security

*   **Use a strong, unique password** for your database.
*   **Restrict public access** to your database. If your database provider supports it, configure firewall rules to only allow connections from the IP addresses of your deployed services on Vercel and Render.

### HTTPS

*   Vercel and Render automatically provision SSL certificates and serve your applications over HTTPS. This is essential for encrypting data in transit.

### Production Error Handling

*   In a production environment, avoid sending detailed error messages or stack traces to the client, as they can reveal sensitive information about your application's internals.
*   The current setup sends generic error messages, which is good practice. For more advanced scenarios, consider using a logging service to capture detailed error information on the server side.

### Dependency Management

*   Regularly update your project's dependencies to their latest versions to patch security vulnerabilities.
*   You can use tools like `pnpm audit` to check for known vulnerabilities in your dependencies.

---

## Final Steps

After deploying all services, make sure to go back to the environment variable settings for the `web` and `api` services and fill in the URLs of the other deployed services.

Your monorepo application is now fully deployed!