$(function () {
    let userName = localStorage.getItem('userName');
    if (userName == null || userName === 'null') {
        userName = prompt('Type your user name {a-z0-9}:', `user${getRandomInt(9999)}`);
        localStorage.setItem('userName', userName);
    }

    let socket = io();
    socket.emit("it's me", userName);

    // ------------------------------------------------------------------------ OUTGOING

    $('form').submit(function (e) {
            e.preventDefault(); // prevents page reloading
            let command = $('#command');
            let commandValue = command.val().toLowerCase();

            if (commandValue.startsWith("play")) {

                commandValue = commandValue.replace('play', '').trim();
                socket.emit('play', commandValue);

            } else if (commandValue.startsWith("shoot")) {
                commandValue = commandValue.replace('shoot', '').trim().toUpperCase();

                let command = positionToCoordinates(commandValue);
                if (command != null) {
                    socket.emit('shoot', command);
                }

            } else if (commandValue.startsWith("accept")) {
                commandValue = commandValue.replace('accept', '').trim();
                socket.emit('accept', commandValue);

            } else if (commandValue.startsWith("decline")) {
                commandValue = commandValue.replace('decline', '').trim();
                socket.emit('decline', commandValue);

            } else if (commandValue.startsWith("cancel")) {
                commandValue = commandValue.replace('cancel', '').trim();
                socket.emit('cancel', commandValue);

            } else if (commandValue.startsWith("ship")) {
                commandValue = commandValue.replace('ship', '').trim();
                let args = commandValue.split(" ");
                if (args.length !== 2) {
                    $('#messages').append($('<li>').text(`there is something wrong with parameter: "${commandValue}"`));
                }
                let command = positionToCoordinates(args[1]);
                if (command != null) {
                    socket.emit('ship', args[0] + " " + command);
                    return
                }
                $('#messages').append($('<li>').text(`there is something wrong with parameter: "${commandValue}"`));

            } else if (commandValue.startsWith("scoreboard")) {
                socket.emit('scoreboard');

            } else if (commandValue.startsWith("stats")) {
                commandValue = commandValue.replace('stats', '').trim();
                if (commandValue == null || commandValue === "") {
                    commandValue = userName;
                }
                socket.emit('stats', commandValue);

            } else if (commandValue.startsWith("help")) {
                $('#messages').append($('<li>').html(
                    "Start game: play [array={num}] [ships={num}] [opponent={nickname}] <br>" +
                    "Accept received invitation for a game: accept opponent={nickname} <br>" +
                    "Decline received invitation for a game: decline opponent={nickname} <br>" +
                    "Cancel sent game invitation: cancel opponent={nickname} <br>" +
                    "Shoot at some position: shoot {A-Z }{1-25} <br>" +
                    "Place your ship at some position: ship {shipname} {A-Z}{1-25} <br>" +
                    "Show scoreboard: scoreboard <br>" +
                    "Show my statistics: stats <br>" +
                    "Show statistics for another player: stats {nickname}<br>"
                ));

            } else {
                socket.emit('chat message', commandValue);

            }
            command.val('');
            return false;
        }
    )
    ;

    // ------------------------------------------------------------------------ INCOMING

    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('scoreboard', function (msg) {
        let json = JSON.parse(msg);

        let table = `<table class="scoreboard"><tr><th>Rank</th><th>Name</th><th>Games won</th><th>Games played</th><th>Score</th></tr>`;
        json.forEach((player, i) => {

            table += `<tr><td>${i + 1}</td><td>${player.name}</td><td>${player.gamesWon}</td><td>${player.gamesPlayed}</td><td>${player.score}</td></tr>`;

        })

        table += "</table>";

        $('#messages').append($('<li>').html(`<h3>Scoreboard</h3> ${table}`));

    });

    socket.on('stats', function (msg) {
        let json = JSON.parse(msg);

        let table = `<table class="scoreboard"><tr><th>Name</th><th>Games won</th><th>Games played</th><th>Score</th></tr>`
            + `<tr><td>${json.name}</td><td>${json.gamesWon}</td><td>${json.gamesPlayed}</td><td>${json.score}</td></tr>`
            + "</table>";

        $('#messages').append($('<li>').html(`<h3>Statistics</h3> ${table}`));

    });

    socket.on('hit', function (msg) {
        let coord = msg.split(",");

        if (coord == null || coord[0] == null || coord[1] == null) {
            $('#messages').append($('<li>').text(`there is something wrong with server response: "${msg}"`));
            return
        }
        $(`#field-opponent .row:nth-child(${coord[0]}) .col:nth-child(${coord[1]})`).text('O')

        $('#field-player').toggleClass("turn");
        $('#field-opponent').toggleClass("turn");
    });

    socket.on('miss', function (msg) {
        let coord = msg.split(",");

        if (coord == null || coord[0] == null || coord[1] == null) {
            $('#messages').append($('<li>').text(`there is something wrong with server response: "${msg}"`));
            return
        }
        $(`#field-opponent .row:nth-child(${coord[0]}) .col:nth-child(${coord[1]})`).text('X')

        $('#field-player').toggleClass("turn");
        $('#field-opponent').toggleClass("turn");
    });

    socket.on('opponent miss', function (msg) {
        let coord = msg.split(",");

        if (coord == null || coord[0] == null || coord[1] == null) {
            $('#messages').append($('<li>').text(`there is something wrong with server response: "${msg}"`));
            return
        }
        $(`#field-player .row:nth-child(${coord[0]}) .col:nth-child(${coord[1]})`).text('X')

        $('#field-player').toggleClass("turn");
        $('#field-opponent').toggleClass("turn");
    });

    socket.on('opponent hit', function (msg) {
        let coord = msg.split(",");

        if (coord == null || coord[0] == null || coord[1] == null) {
            $('#messages').append($('<li>').text(`there is something wrong with server response: "${msg}"`));
            return
        }
        $(`#field-player .row:nth-child(${coord[0]}) .col:nth-child(${coord[1]})`).text('O')

        $('#field-player').toggleClass("turn");
        $('#field-opponent').toggleClass("turn");
    });

    socket.on('game invite', function (msg) {
        let coord = msg.split("=");

        if (coord == null || coord[0] == null || coord[1] == null) {
            $('#messages').append($('<li>').text(`there is something wrong with server response: "${msg}"`));
            return
        }
        $('#messages').append($('<li>').text(`INVITE: ${msg} challenged you for a game. To respond, write "accept ${msg}" or "decline ${msg}".`));
    });

    socket.on('invite deleted', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('waiting for opponent', function (msg) {
        let coord = msg.split("=");

        if (coord == null || coord[0] == null || coord[1] == null) {
            $('#messages').append($('<li>').text(`there is something wrong with server response: "${msg}"`));
            return
        }
        $('#messages').append($('<li>').text(`WAITING FOR OPPONENT TO RESPOND: ${msg} was challenged for a game. To cancel the challenge, write "cancel ${msg}".`));
    });

    socket.on('wrong parameters', function (msg) {
        $('#messages').append($('<li class="error">').text(msg));
    });

    socket.on('not your turn', function () {
        $('#messages').append($('<li class="error">').text("Its not your turn. You have to wait for opponent to play."));

        $('#field-player').removeClass("turn");
        $('#field-opponent').addClass("turn");
    });

    socket.on('construct game', function (params) {
        let fieldSize = 10;
        console.log(params);

        let argArray = params.split(" ");

        for (let i in argArray) {
            let arg = argArray[i].split("=");

            switch (arg[0]) {
                case "field":
                    fieldSize = parseInt(arg[1]);
                    break;
                case "ships":
                    console.log(arg[1]);
                    break;
                case "yourTurn":
                    $('#field-player').addClass("turn");
                    break;
                default:
                    $('#messages').append($('<li>').text(`There is something wrong with argument while creating game: "${argArray[i]}"`));
                    return;
            }
        }

        // generate one row according to width
        let oneRow = '<tr class="row"><td class="col">X</td>';
        for (let i = 0; i < fieldSize; i++) {
            oneRow += '<td class="col"></td>';
        }
        oneRow += '</tr>';

        let firstRow = '<tr class="row"><td class="row"></td>';
        for (let i = 0; i < fieldSize; i++) {
            firstRow += `<td class="row">${i}</td>`;
        }
        firstRow += '</tr>';

        //generate rows in both playing fields fields
        let field = firstRow;
        for (let i = 0; i < fieldSize; i++) {
            field += oneRow;
            field = field.replace(/X/i, `${String.fromCharCode(i + 65)}`); //65 char-code of A
        }

        $('.field').append(field);
    });

    socket.on('game ended', function (param) {

        switch (param) {
            case "win":
                break;
            case "loss":
                break;
            default:
                $('#messages').append($('<li>').text(`There is something wrong with argument while ending game: "${param}"`));
                return;
        }
        $('#field-player').html("");
        $('#field-opponent').html("");
    });

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function positionToCoordinates(command) {
        let coordinates = command.match(/[a-zA-Z]+|\d+/g)

        if (coordinates == null || coordinates.length !== 2) {
            $('#messages').append($('<li>').text(`You can not shoot at position ${coordinates}`));
            return null
        }
        let row, col = null;

        for (let i in coordinates) {
            if (/^[A-Z]+$/.test(coordinates[i])) {
                row = coordinates[i].charCodeAt(0) - 65;

            } else if (/^\d+$/.test(coordinates[i])) {
                col = parseInt(coordinates[i]);

            } else {
                $('#messages').append($('<li>').text(`You can not shoot at position ${coordinates}`));
                return null
            }
        }
        return `${row},${col}`
    }

    $('#quitBtn').on('click', () => {
        localStorage.removeItem('userName');
        location.reload();
    });

});