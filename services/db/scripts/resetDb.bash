#!/bin/bash

# Script to reset database

cd "$(dirname "$0")" || exit 1 # for correct path to the insert files, relative to the script

# SCRIPTS=(insertBikes.js)
# SCRIPTS=(insertBikes.js insertTrips.js)
SCRIPTS=(insertBikes.js insertCities.js insertRoutes.js insertRules.js insertStations.js insertTrips.js insertUsers.js)
# SCRIPTS=(insertBikes.js insertCities.js insertRules.js insertStations.js insertTrips.js)

echo "Updating the database..."
echo "------------------------------------"

for script in "${SCRIPTS[@]}"; do
    echo "Executing $script..."
    
    node "$script"

    if [ $? -ne 0 ]; then
        echo "Error: $script failed. Database could not be updated."
        exit 1
    fi
done

echo "------------------------------------"
echo "Database updated sucecssfully!"
exit 0