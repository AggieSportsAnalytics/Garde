# 🤺 Garde Backend Setup

> **Follow this tutorial to set up the backend cloudflare worker component of Garde!**

---

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Instructions](#setup-instructions)
   - [Clone the Repository](#1-clone-the-repository)
   - [Install Dependencies](#2-install-dependencies)
   - [Configure Environment Variables](#3-configure-environment-variables)
   - [Run the Development Server](#4-run-the-local-worker)
3. [Installing Additional Packages](#installing-additional-packages)
4. [Testing Your Setup](#testing-your-setup)
5. [Deploying Your Changes](#deploying-your-changes)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js** (v16 or higher): [Download here](https://nodejs.org/)
- **npm**: Comes bundled with Node.js. Run `npm -v` to check if it's installed.
- **wrangler**: `npm install -g wrangler`

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/GardeFencing/Garde.git
cd Garde/cloud-setup/garde
```

---

### 2. Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

---

### 3. Configure Environment Variables

1. Create a `wrangler.toml` file in the `garde` directory:
   ```bash
   touch wrangler.toml
   ```

2. Add the necessary environment variables. It is **YOUR** responsibility to keep up to date with the latest `wrangler.toml`. Make sure to ask if you do not have the up-to-date variables.

---

### 4. Run the Local Worker

Start the cloudflare local worker:

```bash
wrangler dev --remote --port 8000 --env dev
```

The backend will be accessible at `http://localhost:8000`.

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

1. Open `http://localhost:8000` in your browser, there should be {"error":"Failed to verify token"}.
2. Verify that the web app loads without errors (if running).
3. Ensure API calls to this backend are functioning correctly with the `wrangler.toml` configuration.

---

## Deploying Your Changes

Deploy the cloudflare worker:

> Note: If you are publishing the whole app (including web app), this command is automatically run in the [deploy script](../scripts/deploy.sh) alongside the web app deployment. Otherwise, for small bug fixes, this command will suffice.

```bash
wrangler deploy
```

---

## Troubleshooting

- **Issue**: `wrangler.toml` variables aren't loaded.
  **Solution**: Ensure the `wrangler.toml` file is in the root of the `garde` directory and correctly formatted.