#!/bin/bash

cd C:/inetpub/wwwroot/your-project

echo "Pulling latest code..."
git pull origin main

echo "Installing backend dependencies..."
cd backend
npm install

echo "Restarting backend..."
pm2 restart backend || pm2 start server.js --name backend

echo "Building frontend..."
cd ../frontend
npm install
npm run build

echo "Deployment completed!"