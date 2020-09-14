const express = require('express');
const favicon = require('serve-favicon');
const fetch = require('node-fetch');
const path = require('path');

let app = express();

app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get('/city/:name', (req, res) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.params.name}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            res.status(200).json(data);
        })
        .catch(function (err) {
            console.log(`Something goes wrong. Error: ${err}`);
        });
});

app.get('/city/:lat/:lon', (req, res) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.params.lat}&lon=${req.params.lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            res.send(data);
        })
        .catch(function (err) {
            console.log(`Something goes wrong. Error: ${err}`);
        });
});

app.use((request, response, next) => {
    response.status(404).send("Not Found")
});

const server = app.listen(2000, () => {
    console.log(`Express is running on port ${server.address().port}`);
});