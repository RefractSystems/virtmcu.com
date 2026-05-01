# VirtMCU.com

> **The High-Performance Bridge Between QEMU and Renode.**

This repository contains the source code for [virtmcu.com](https://virtmcu.com), the official landing page and documentation portal for the **VirtMCU** project.

## 📡 THE MISSION

VirtMCU enables embedded systems engineers to run Renode platform descriptions (`.repl`) on QEMU with native performance and deterministic clock synchronization. It is a core component of the **FirmwareStudio** digital twin platform.

## 🏗️ SITE ARCHITECTURE

This is a professional, high-performance web interface built to showcase VirtMCU's technical capabilities.

- **Framework:** Next.js 15 (App Router)
- **Styling:** Vanilla CSS (Modern, High-Tech Theme)
- **Database:** Cloud Firestore (for updates/waitlist)
- **Analytics:** Firebase Analytics
- **Deployment:** Firebase App Hosting

## 🚀 GETTING STARTED (LOCAL DEV)

### 1. Clone the Frontend

```bash
git clone https://github.com/RefractSystems/virtmcu.com.git
cd virtmcu.com
```

### 2. Configure Environment

Create a `.env.local` file with your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=virtmcu-com.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=virtmcu-com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=virtmcu-com.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy Firestore Rules

To secure the Firestore database (e.g., locking down the waitlist/subscribers collection), you must deploy the security rules. Ensure you are authenticated with Firebase first:

```bash
# Login to Firebase (if not already logged in)
npx firebase login

# Deploy the rules
npm run deploy:rules
```

## 🔗 PROJECT ECOSYSTEM

VirtMCU is part of a broader ecosystem for firmware simulation:

- **[virtmcu](https://github.com/RefractSystems/virtmcu):** The core QEMU-based simulation engine, plugins, and `repl2qemu` tool.
- **[FirmwareStudio](https://firmware.studio):** The comprehensive digital twin platform that integrates VirtMCU with physics engines and cloud-based CI/CD.

## 🤝 CONTRIBUTING

We welcome contributions to the landing page and documentation. For core engine changes, please visit the [VirtMCU Engine Repository](https://github.com/RefractSystems/virtmcu).

---

_Built by [Refract Systems](https://refractsystems.com)._
