$(function () {
    let userName = localStorage.getItem('userName');
    if (userName == null) {
        userName = prompt('Type your user name:', 'user123');
        localStorage.setItem('userName', userName);
    }

    let socket = io();
    socket.emit("it's me", userName);

    // ------------------------------------------------------------------------ OUTGOING

    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        let command = $('#command');
        let commandValue = command.val();

        if (commandValue.startsWith("play")) {

            commandValue = commandValue.replace('play', '').trim();
            socket.emit('play', commandValue);

        } else if (commandValue.startsWith("shoot")) {

            commandValue = commandValue.replace('shoot', '').trim();
            socket.emit('shoot', commandValue);

        } else {

            socket.emit('chat message', commandValue);

        }
        command.val('');
        return false;
    });

    // ------------------------------------------------------------------------ INCOMING

    socket.on('chat message', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('hit', function (msg) {
        $('#field-opponent .row:nth-child(2) .col:nth-child(2)').text('O')
    });

    socket.on('miss', function (msg) {
        $('#field-opponent .row:nth-child(2) .col:nth-child(2)').text('X')
    });

    socket.on('opponent-miss', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('opponent-hit', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('game invite', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('waiting for opponent', function (msg) {
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('wrong parameters', function (msg) {
        $('#messages').append($('<li class="error">').text(msg));
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
            field = field.replace(/X/i, `${String.fromCharCode(i+65)}`); //65 char-code of A
        }

        $('.field').append(field);
    });


    $('#quitBtn').on('click', () => {
        localStorage.removeItem('userName');
        location.reload();
    });

});