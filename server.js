var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var fs = require('fs')

app.get('/', function (req, res) {
    return res.sendFile(__dirname + '/index.html')
});

// app.get('/trigger', function (req, res) {
//     fs.readFile(__dirname + '/data.txt', 'utf8', function (err, sData) {
//         console.log(sData)
//         io.emit('this is the data', { "status": sData })
//         res.send('done')
//     })
// })

var clients = []

io.on('connection', function (socket) {
    console.log('New connection with ID:', socket.id)

    socket.on('storeClientInfo', function (data) {

        var clientInfo = new Object()
        clientInfo.alias = data.alias;
        clientInfo.clientId = socket.id;
        clientInfo.icon = data.icon;
        clientInfo.color = data.color;
        clients.push(clientInfo);

        io.emit('client joined the chat', { 
            "status": "joined the conversation via",
            "alias": data.alias,
            "color": data.color,
            "icon": data.icon
        })

        io.emit('client data changed', {
            "status": "ok",
            "clients": clients
        })

        socket.on('disconnect', function (reason) {
            console.log("Disconnect: ", socket.id, reason)

            let client = clients.findIndex(x => x.clientId == socket.id);
            clients.splice(client, 1);
         });
    });

    socket.on('client sent message', function (jData) {
        let client = clients.findIndex(x => x.clientId == socket.id);

        console.log(clients[client])
        // send data to everyone but sender
        console.log(jData, socket.id)
        socket.broadcast.emit('server sent message', { 
            "status": jData.message, 
            "alias": clients[client].alias, 
            "color": clients[client].color 
        })

    })
});

http.listen(80, function () {
    console.log('listening on port 80')
});