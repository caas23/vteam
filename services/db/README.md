# Vteam database

The database for the vteam project.

### About

The database is a MongoDb document database. There is one database (_vteam_) that runs against the applications as well as another database (_vteam_test_), that is used for backend testing.

### Running

The development database is connected to the _Solo Scoot_ system and is started together with the rest of the system's applications during [simulation](https://github.com/caas23/vteam/tree/main/simulation).

The test database is connected to the testing and run together with the testing described [here](https://github.com/caas23/vteam/tree/main/services/rest-api).


### Reset database

The database can be reset to its original state by running `./resetDb.bash`*.

_* Note that this can be done directly during [simulation](https://github.com/caas23/vteam/tree/main/simulation) by adding a --reset flag. The 'manual' reset described above is only needed if not in the simulation context._