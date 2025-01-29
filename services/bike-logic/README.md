# Vteam bike

_Bike logic for vteam project._

### About

The bike logic handles the bikes and their state in the _Solo Scoot_ system. This includes, but is not limited to, logic for starting and stopping the bike, logic for putting the bike into different states, such as for example service mode. The bike logic is also responsible for updating a bike's properties such as for example speed, postion or battery level.

### Running

The bike logic is integrated into the system as a whole, and is part of the [simulation](https://github.com/caas23/vteam/tree/main/simulation) and real-time rental of bikes. The logic is used to allow the bikes and different parts of the system to communicate via the [rest-api](https://github.com/caas23/vteam/tree/main/services/rest-api) to create a smooth interaction for the different users of the system.