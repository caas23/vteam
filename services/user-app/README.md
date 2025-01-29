# Vteam user app

_The user's mobile application for the vteam project._

### About

Via the app, the user can first and foremost rent electric scooters via _Solo Scoot_. In addition, the user can view and manage their account and view their previous trips. To access the application, authentication via Github OAuth is required.

The app can be run in both light mode and dark mode and automatically adapts to your phone's settings.

### Running

To run as part of the entire project, see [simulation](https://github.com/caas23/vteam/tree/main/simulation).

To run as a standalone application, follow the short guide below.

#### Good to know before diving in

Accessing the user app requires `Expo Go` and an actual phone*. Please note that the app is **not** compatible to run on the web, as it's a _native app_ developed for phone devices only.

_* Other options would be to run with [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/) or [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/), see documentation for more information on how to set up such environments_

#### Steps to get the app up and running
- Download `Expo Go` on your phone (no registration required).
- Run `npx expo start --tunnel`, add `--clear` to clear cache if needed. 
- Scan the QR code that appears in the terminal when the system is running.
- Explore the app on your actual phone!

#### Extra

To run the app connected to a database** (which is recommended for full user experience), a few more steps are needed. As the backend is served on the computer's localhost, `ngrok` is used to connect the app to the backend running on the computer.

- Make sure `ngrok` is set up and can be run in your environment before proceeding.
- Run `ngrok http --url=bulldog-master-distinctly.ngrok-free.app 1337`.
    - Note that the url is specific for the app and needed for the authentication via OAuth to work.
- Thanks to ngrok, the app will now be able to communicate with the backend that has been fired up on your computer's localhost.


_** Note that the application runs against the backend set up in [rest-api](https://github.com/caas23/vteam/tree/main/services/rest-api)._
