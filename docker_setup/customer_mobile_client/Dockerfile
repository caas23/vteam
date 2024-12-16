FROM ubuntu:22.04

RUN apt update && apt install -y curl jq

WORKDIR /client

COPY vteam-client.bash .

COPY server.txt .

CMD ["bash", "vteam-client.bash", "test"]
