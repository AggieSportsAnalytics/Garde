#!/bin/bash

# 1. pulling latest
# 2. installing frontend deps
# 3. building frontend
# 4. installing worker deps
# 5. deploying worker
# 6. stopping current prod server
# 7. restarting/starting prod server

set -e # Exit immediately if any command fails

# Navigate to the directory containing this script
cd "$(dirname "$0")"

# Navigate to the project directory
echo "Changing to the project directory..."
cd ../garde

# Pull latest code
echo "Pulling latest changes from git..."
if ! git pull origin main; then
    echo "Git pull failed. Exiting."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
if ! npm install --legacy-peer-deps; then
    echo "npm install failed. Exiting."
    exit 1
fi

# Build the project
echo "Building the project..."
if ! npm run build; then
    echo "Build process failed. Exiting."
    exit 1
fi

# Navigate to the Cloudflare worker directory
echo "Changing to the Cloudflare worker directory..."
cd ../cloud-setup/garde

# Install dependencies
echo "Installing dependencies..."
if ! npm install; then
    echo "npm install failed. Exiting."
    exit 1
fi

# Deploy Cloudflare worker
echo "Deploying Cloudflare worker..."
if ! wrangler deploy; then
    echo "Failed to deploy worker. Exiting."
    exit 1
fi

# Navigate back to the project directory for PM2 commands
cd ../../garde

# Stop the PM2 process if it exists
pm2 stop garde-prod || echo "garde-prod is not running, skipping stop."

# Start or restart the PM2 process
if pm2 describe garde-prod > /dev/null; then
    echo "Restarting PM2 process..."
    pm2 restart garde-prod
else
    echo "Starting PM2 process..."
    pm2 start npm --name garde-prod -- run start
fi

# Save PM2 process list
pm2 save

echo "Deployment completed successfully!"
