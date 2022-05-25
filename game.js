class Game {
    static createSingleplayer(player, socket) {
        return new Game(player, "AI", socket, null, false);
    }

    static createMultiplayer(player1, player2, socket1) {
        return new Book(player1, player2, socket1, users[player2], true);
    }

    constructor(player1, player2, socket1, socket2, type) {
        this.player1 = player1;
        this.player2 = player2;
        this.multiplayer = type;
        this.singleplayer = !type;
        this.fieldSize = 10;
        this.shipsNum = 6;
        this.player1Socket = socket1;
        this.player2Socket = socket2;
    }

    // private parameters 
    // boolean win
    // timestamp start-end
    // both player's number of destroyed ships

    
}