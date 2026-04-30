# Eve Gleam - Headless WooCommerce Storefront

A stunning, animation-rich headless WooCommerce storefront built with Next.js 14 (App Router) for Hostinger static export.

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS v3
- Framer Motion & GSAP (Scroll animations)
- tsParticles
- WooCommerce REST API (Client-side)

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.local.example` to `.env.local` and add your WooCommerce credentials:
   ```env
   NEXT_PUBLIC_WC_URL=https://your-woocommerce-backend.com
   NEXT_PUBLIC_WC_KEY=ck_your_consumer_key
   NEXT_PUBLIC_WC_SECRET=cs_your_consumer_secret
   ```

3. **Run Dev Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Build & Deployment (Hostinger Node.js App)

This application is configured as a standalone **Node.js application**. Hostinger supports Node.js on Business and Cloud plans.

1. **Upload your code to Hostinger:**
   - The best way is to connect your GitHub repository directly to Hostinger.
   - Alternatively, you can zip the folder (excluding `node_modules` and `.next`) and upload it via File Manager.

2. **Create the Node.js App in hPanel:**
   - Go to your Hostinger hPanel -> Websites -> **Node.js Apps**.
   - Create a new app and point it to your project directory.
   - Set the Application Startup File to `server.js`.
   - Set the Install Command to: `npm install`
   - Set the Build Command to: `npm run build`
   - Set the Start Command to: `node server.js`

3. **Add Environment Variables:**
   - In the Node.js App settings on Hostinger, add your WooCommerce keys as environment variables exactly as they appear in your `.env.local` file.

4. **Deploy:**
   - Click "Save and Deploy" to launch your full server-side Next.js application!

## Features
- Cinematic Hero with floating particles
- Smooth Scroll Animations with Framer Motion & GSAP
- Interactive Cart Drawer with LocalStorage persistence
- Client-side WooCommerce data fetching
- Mobile Responsive with disabled animations on mobile for performance
