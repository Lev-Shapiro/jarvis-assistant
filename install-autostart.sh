#!/bin/bash

# Create LaunchAgents directory if it doesn't exist
mkdir -p ~/Library/LaunchAgents

# Copy the plist file to LaunchAgents directory
cp ./com.jarvisos.autostart.plist ~/Library/LaunchAgents/

# Set correct permissions
chmod 644 ~/Library/LaunchAgents/com.jarvisos.autostart.plist

# Check if electron has camera permissions
echo "Important: Camera permissions are required for this application to work properly."
echo "You will need to manually grant camera access to Electron when prompted."
echo "If no prompt appears, you may need to enable camera access in System Preferences > Security & Privacy > Camera"

# Load the LaunchAgent
launchctl unload ~/Library/LaunchAgents/com.jarvisos.autostart.plist 2>/dev/null
launchctl load ~/Library/LaunchAgents/com.jarvisos.autostart.plist

echo "JarvisOS autostart has been installed and loaded."
echo "The application will now start automatically when you log in and stop when you shut down."
echo ""
echo "NOTE: If camera functionality isn't working, try running the app once manually with 'npm run start'"
echo "to ensure all permissions are properly granted, then restart your computer." 