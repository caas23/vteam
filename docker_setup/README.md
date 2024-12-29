# Vteam docker

Below are instructions to get started and run the entire _Solo Scoot_ system.

## Running the system

The system is started using _Docker Compose_ and _Localtunnel_ to easily allow the app communicate with the backend when you run it on your actual phone device (more on that note later).

To get the system up and running, simply navigate to this folder and run

`./system_up.bash`

## Accessing clients

To access a client, either follow the instructions in the terminal once the command above has been run, or have a look at the short recap below.

### Admin

The administrator website can be found at `http://localhost:5173`

### User

The user website can be found at `http://localhost:5174`

Accessing the user app requires Expo Go and an actual phone. Please note that the app is not compatible to run on the web, as it's a native app developed for phone devices only.

#### Steps to get the user app up and running
- Download `Expo Go` on your phone (no registration required).
- Start the system as show at the top.
- Scan the QR code that appears in the terminal when the system is running.
- Explore the app!

For more information about each individual client, navigate to its folder under `services`.
