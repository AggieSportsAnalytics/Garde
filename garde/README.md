# 🤺 Garde Web App Setup

> **Follow this tutorial to set up the fullstack web component of Garde!**

---

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Instructions](#setup-instructions)
   - [Clone the Repository](#1-clone-the-repository)
   - [Install Dependencies](#2-install-dependencies)
   - [Configure Environment Variables](#3-configure-environment-variables)
   - [Run the Development Server](#4-run-the-development-server)
   - [Test the Production Build](#5-test-the-production-build)
3. [Installing Additional Packages](#installing-additional-packages)
4. [Testing Your Setup](#testing-your-setup)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js** (v16 or higher): [Download here](https://nodejs.org/)
- **npm**: Comes bundled with Node.js. Run `npm -v` to check if it's installed.

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/GardeFencing/Garde.git
cd Garde/garde
```

---

### 2. Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

---

### 3. Configure Environment Variables

1. Create a `.env.local` file in the `garde` directory:
   ```bash
   touch .env.local
   ```

2. Add the necessary environment variables. It is **YOUR** responsibility to keep up to date with the latest `.env.local`. Make sure to ask if you do not have the up-to-date variables.

---

### 4. Run the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The app will be accessible at `http://localhost:3000`.

---

### 5. Test the Production Build

To simulate the production environment (always do before pushing):

1. Build the app:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

The production build will also be accessible at `http://localhost:3000`.

---

## Installing Additional Packages

If you need to install new packages, use the following command:

> **IMPORTANT**: npm packages are community maintained so there is **always** a possibility that code provided can be malicious. Ex: Polyfil, a package used by 100,000+ websites was found to have malicious code: [Video](https://www.youtube.com/watch?v=mmlHQyMOK7Y). The burden of responsibility is on **YOU** as the developer to use as much original code as possible in **Garde**, less we all face the consequences. npm packages not only slow down the website by adding additional weight to node modules, but also add security vulnerabilities through introducing code which we did not write, whether that be malicious or simply security oversights. There is also the issue of having dependency issues when some packages to require different versions of other packages, leading us to use outdated packages which introduces security concerns.

```bash
npm install <package-name>
```

For example, to install Axios:
```bash
npm install axios
```

---

## Testing Your Setup

1. Open `http://localhost:3000` in your browser.
2. Verify that the app loads without errors.
3. Ensure API calls are functioning correctly with the `.env.local` configuration.

---

## Troubleshooting

- **Issue**: `.env.local` variables aren't loaded.  
  **Solution**: Ensure the `.env.local` file is in the root of the `garde` directory and correctly formatted.