const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');

let app = express();

app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.get('/test', (req, res) => {
    res.send(JSON.stringify({a: 1, b: 3}));
});


app.use((request, response, next) => {
    response.status(404).send("Not Found")
});

const server = app.listen(2000, () => {
    console.log(`Express is running on port ${server.address().port}`);
});