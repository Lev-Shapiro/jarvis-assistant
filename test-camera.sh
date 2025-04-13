#!/bin/bash

# This script runs the application directly to test camera functionality
# and ensure permissions are properly granted

cd "$(dirname "$0")"
npm run start

echo "If the camera worked correctly in this test but not when running via LaunchAgent,"
echo "please run the install-autostart.sh script again after closing this application." 