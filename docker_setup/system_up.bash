#!/bin/bash

docker-compose up --build -d

clear
echo "Starting system..."
sleep 10

lt -s --port 1337 --subdomain vteambackend &
# Show QR code (comment out if the app is already linked to Expo Go)
docker logs -f user-app | awk '/Tunnel ready\./, /› Metro waiting/ {line++; if (line >= 2 && line <= 18) print $0}' &

# Make sure QR code comes first in the terminal output
sleep 5

echo "========================================================="
echo "Admin web available at http://localhost:5173"
echo "User web available at http://localhost:5174"
echo "User app available via QR code above (open with Expo Go)"
echo "========================================================="

while true; do
    read -p "Type 'exit' to stop the system: " user_input
    if [[ "$user_input" == "exit" ]]; then
        pkill -f "lt --port 1337 --subdomain vteambackend"
        
        docker-compose down
    
        echo "========================================================="
        echo "System stopped."
        break
    fi
done
