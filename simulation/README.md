# Vteam simulation

Below are instructions to get started and run the entire _Solo Scoot_ system.

## Running the system

The system is started using _Docker Compose_ and _ngrok_, to easily allow the app communicate with the backend when you run it on your actual phone device (more on that note later).

To get the system up and running, simply navigate to this folder and run

`./system_up.bash`

If you wish to reset the system and database to its initial state, run

`./system_up.bash --reset`

## Accessing clients

To access a client, either follow the instructions in the terminal once the command above has been run, or have a look at the short recap below.

### Admin
The administrator website can be found at `http://localhost:5173`

### User

The user website can be found at `http://localhost:5174`

Accessing the user app requires `Expo Go` and an actual phone*. Please note that the app is **not** compatible to run on the web, as it's a _native app_ developed for phone devices only.

_* Other options would be to run with [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/) or [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/), see documentation for more information on how to set up such environments_

#### Steps to get the user app up and running
- Download `Expo Go` on your phone (no registration required).
- Start the system as shown at the top.
- Scan the QR code that appears in the terminal when the system is running.
    - Thanks to ngrok, the app will now be able to communicate with the backend that has been fired up on your computer's localhost.
- Explore the app on your actual phone!

For more information about each individual client, navigate to its folder under `~/vteam/services`.
