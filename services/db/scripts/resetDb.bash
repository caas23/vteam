#!/bin/bash

# Script för att lägga till/återställa databasen

# SCRIPTS=(insertBikes.js)
# SCRIPTS=(insertBikes.js insertTrips.js)
SCRIPTS=(insertBikes.js insertCities.js insertRoutes.js insertRules.js insertStations.js insertTrips.js insertUsers.js)
# SCRIPTS=(insertBikes.js insertCities.js insertRules.js insertStations.js insertTrips.js)

echo "Återställ och uppdatera databasen."
echo "------------------------------------"

for script in "${SCRIPTS[@]}"; do
    echo "Exekverar $script..."
    
    node "$script"

    if [ $? -ne 0 ]; then
        echo "Fel: $script misslyckades. Databasen kunde inte återställas."
        exit 1
    fi
done

echo "------------------------------------"
echo "Databasen återställd!"
exit 0