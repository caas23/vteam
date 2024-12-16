#!/usr/bin/env bash

# Exit values:
#  0 on success
#  1 on failure

# Name of the script
SCRIPT=$( basename "$0" )

# Current version
VERSION="1.0.0"

#Port assignment
PORT=${CUSTOM_PORT:-"8080"}

# Server assignment
SERVER=$(cat server.txt)

#
# Message to display for usage and help.
#
function usage
{
    local txt=(
        "Utility $SCRIPT for access-log info."
        "Usage: $SCRIPT [options] <command> [arguments]"
        ""
        "Commands available:"
        ""
        "test              Try passing an argument, or not."
        "bikes             Fetch bike data from test server."

        "use <server>      Set the servername (localhost or service name)."
        ""
        "Options available:"
        ""
        "-h, --help      Display the menu"
        "-v, --version   Display the current version"
    )

    printf "%s\\n" "${txt[@]}"
}

#
# Message to display when bad usage.
#
function badUsage
{
    local message="$1"
    local txt=(
"For an overview of the command, execute:"
"$SCRIPT --help"
    )

    [[ -n $message ]] && printf "%s\\n" "$message"

    printf "%s\\n" "${txt[@]}"
}


#
# Test.
#
function app-test
{
    if [ -z "$1" ]; then
        echo "No argument passed but command call is working."
    else
        echo "Test argument: $1"
    fi
}

#
# Set server.
#
function app-use
{
    echo "$1" > server.txt
    echo "Server is now: $1"
}

#
# Get bikes.
#
function app-bikes
{
    RESPONSE=$(curl -s "$SERVER":"$PORT"/bikes | jq .[])

    echo "$RESPONSE"
}

#
# Process options
#
while (( $# ))
do
    case "$1" in

        --help | -h)
            usage
            exit 0
        ;;

        --version | -v)
            version
            exit 0
        ;;

        bikes       \
        | test)
        command=$1
        arg1=$2
        arg2=$3

        app-"$command" "$arg1" "$arg2"

        exit 0
        ;;

        *)
            badUsage "Option/command not recognized."
            exit 1
        ;;
    esac
done

# Default command if none is specified
if [ -z "$command" ]; then
    echo "No command specified."
    exit 1
fi

badUsage
exit 1