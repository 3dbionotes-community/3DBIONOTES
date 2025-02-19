#!/bin/bash

# Define the file to be modified
FILE="./app/assets/javascripts/webserver/webserver_init.js"

# Define the GA codes
GA_CODE_PRODUCTION="G-BRPGRQ278S"
GA_CODE_DEVELOPMENT="G-1WTRK5CB7C"

# Check the environment argument
if [ "$1" == "--environment" ]; then
    if [ "$2" == "production" ]; then
        GA_CODE=$GA_CODE_PRODUCTION
    elif [ "$2" == "development" ]; then
        GA_CODE=$GA_CODE_DEVELOPMENT
    else
        echo "Invalid environment. Use 'production' or 'development'."
        exit 1
    fi
else
    echo "Usage: $0 --environment [production|development]"
    exit 1
fi

# Replace the GA code in the file
sed -i "s/gtag\/js?id=[^,]*/gtag\/js?id=$GA_CODE\"/" $FILE
sed -i "s/gtag(\"config\", \"[^\"]*\")/gtag(\"config\", \"$GA_CODE\")/" $FILE

echo "Google Analytics code updated to $GA_CODE for $2 environment."
