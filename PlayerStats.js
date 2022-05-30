const {MongoClient} = require("mongodb");
const dbName = "myFirstDatabase";
const uri = `mongodb+srv://root:toor@cluster0.9qvug.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

class PlayerStats {

    static async load(name) {
        return this.loadStats(name).then(
            (dbObject) => {
                if (dbObject == null) {
                    dbObject = {
                        name: name,
                        score: 0,
                        gamesPlayed: 0,
                        gamesWon: 0,
                        hitRate: 0
                    }
                }
                return new PlayerStats(dbObject);
            }
        );

    }

    constructor(dbObject) {
        this.name = dbObject.name;
        this.score = dbObject.score;
        this.gamesPlayed = dbObject.gamesPlayed;
        this.gamesWon = dbObject.gamesWon;
        this.hitRate = dbObject.hitRate;
    }

    async saveStats() {
        try {
            await client.connect();

            const db = client.db(dbName);

            // Use the collection "playerStats"
            const col = db.collection("playerStats");

            // Insert a single player, wait for promise so we can read it back
            // await col.updateOne({name: this.name}, this, {upsert: true });
            await col.updateOne({name: this.name}, {$set:this}, {upsert: true });
        } catch (e) {
            console.error(e)
        } finally {
            await client.close()
        }
    }


    static async loadStats(name) {
        try {
            await client.connect();
            const db = client.db(dbName);

            // Use the collection "games"
            const col = db.collection("playerStats");

            // Find one game document
            return await col.findOne({name: name});
        } catch (e) {
            console.error(e)
        } finally {
            await client.close()
        }
    }

    static async scoreboard(){
        try {
            await client.connect();
            const db = client.db(dbName);

            // Use the collection "games"
            const col = db.collection("playerStats");

            // Find one game document
            return await col.find().sort({ score: -1 }).limit(5).toArray();
        } catch (e) {
            console.error(e)
        } finally {
            await client.close()
        }
    }
}

module.exports = PlayerStats
