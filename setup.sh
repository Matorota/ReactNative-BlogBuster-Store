#!/bin/bash

echo "Setting up BlogBuster Store..."

echo "Installing UserSite dependencies..."
cd UserSite
npm install

echo "Installing AdminSite dependencies..."
cd ../AdminSite
npm install

echo "Setup complete!"
echo ""
echo "To start UserSite: cd UserSite && npm start"
echo "To start AdminSite: cd AdminSite && npm start"
