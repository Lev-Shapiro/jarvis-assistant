#!/bin/bash

# Unload the LaunchAgent if it's loaded
launchctl unload ~/Library/LaunchAgents/com.jarvisos.autostart.plist 2>/dev/null

# Remove the plist file
rm -f ~/Library/LaunchAgents/com.jarvisos.autostart.plist

echo "JarvisOS autostart has been uninstalled."
echo "The application will no longer start automatically when you log in." 