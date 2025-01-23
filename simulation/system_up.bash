#!/bin/bash

# run --reset to reset db before starting system

RESET_DB_SCRIPT="../services/db/scripts/resetDb.bash"

reset_database() {
    if [[ -f "$RESET_DB_SCRIPT" ]]; then
        bash "$RESET_DB_SCRIPT"
        if [[ $? -ne 0 ]]; then
            exit 1
        fi
    else
        echo "Reset script not found, invalid path '$RESET_DB_SCRIPT'"
        exit 1
    fi
}

if [[ "$1" == "--reset" ]]; then
    reset_database
fi

docker-compose up --build -d

clear
echo "Starting system..."
sleep 10

# silence output but save PID for termination later
ngrok http --url=bulldog-master-distinctly.ngrok-free.app 1337 > /dev/null &
NGROK_PID=$!
echo "ngrok process started"

# show QR code (comment out if the app is already linked to Expo Go)
docker logs -f user-app | awk '/Tunnel ready\./, /› Metro waiting/ {line++; if (line >= 2 && line <= 18) print $0}' &

# make sure QR code comes first in the terminal output
sleep 5

echo "========================================================="
echo "Admin web available at http://localhost:5173"
echo "User web available at http://localhost:5174"
echo "User app available via QR code above (open with Expo Go)"
echo "========================================================="

while true; do
    read -p "Type 'exit' to stop the system: " user_input
    if [[ "$user_input" == "exit" ]]; then
        if [[ -n "$NGROK_PID" ]] && kill -0 "$NGROK_PID" 2>/dev/null; then
            kill "$NGROK_PID"
            echo "ngrok process stopped"
        else
            echo "No active ngrok process found."
        fi
        
        docker-compose down
    
        echo "========================================================="
        echo "System stopped."
        break
    fi
done