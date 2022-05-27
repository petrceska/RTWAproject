class PlayerStats{

    constructor(name) {
        this.name = name;
        this.score = 0;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.hitRate = 0;
    }

    evaluateGame(game){
        this.gamesPlayed += 1;
    }
}