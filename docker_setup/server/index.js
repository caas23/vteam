const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());

app.get('/', (req, res) => {
    res.json({
        "Available routes": [
            { "path": "/", "description": "Info page" },
            { "path": "/bikes", "description": "Get entire bike file" }
        ]
    });
});

app.get('/bikes', (req, res) => {
    const dataFile = require("../data/test.json");

    res.json(dataFile);
});

app.listen(port);
