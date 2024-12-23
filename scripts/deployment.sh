#!/bin/bash

set -e # Exit immediately if any command fails

# Stop the PM2 process if it exists
pm2 stop garde-prod || echo "garde-prod is not running, skipping stop."

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
