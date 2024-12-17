#!/bin/bash

# Script för att lägga till/återställa databasen

SCRIPTS=("insertCities.js" "insertStations.js" "insertRules.js" "insertUsers.js")

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

# Meddelande när alla skript är klara
echo "------------------------------------"
echo "Databasen återställd!"
exit 0