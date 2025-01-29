# Vteam API

API for the vteam project.

### About

The API ensures communication between the different parts of the entire system, 
partly via database queries and calls, and partly via real-time communication via Sockets. 
In order for an application to be able to communicate with the API, the user of the application must be authenticated via OAuth.

### Running

To run as part of the entire project, see [simulation](https://github.com/caas23/vteam/tree/main/simulation).

To run as a standalone application, run `npm run dev` and then start the backend on `localhost:1337/`. From there, simply follow the descriptions given to navigate further.*

_* Remember that most routes are protected and require authentication for access._

### Testing

The API endpoints are tested using `Jest`, together with a test database _vteam_test_. 

With `npm test` you can run the tests and get an overview of the coverage.

### Documentation

The API is documented using `JSDoc`, to access the documention, start the service as explained above and then visit `localhost:1337/docs`**.

_** As of now, the API has one available version (v1)_

