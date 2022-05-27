class Ship {
    constructor(type, pos_x, pos_y) {
        this.type = type;
        this.pos_x = pos_x;
        this.pos_y = pos_y;
    }

    set setType(type) {
        this.type = type;
        this.shipSize(type);
    }

    changeShipPosition(x = this.pos_x, y = this.pos_y) {
        this.pos_x = x;
        this.pos_y = y;
    }

    shipSize(type) {
        switch (type) {
            case "2x1":
                this.len = 2;
                this.width = 1;
                break;
            case "3x1":
                this.len = 3;
                this.width = 1;
                break;
            case "4x1":
                this.len = 4;
                this.width = 1;
                break;
            case "1x2":
                this.len = 1;
                this.width = 2;
                break;
            case "1x3":
                this.len = 1;
                this.width = 3;
                break;
            case "1x4":
                this.len = 1;
                this.width = 4;
                break;
            case "2x2":
                this.len = 2;
                this.width = 2;
                break;
            case "3x2":
                this.len = 3;
                this.width = 2;
                break;
            case "2x3":
                this.len = 2;
                this.width = 3;
                break;
            default:
                this.len = 2;
                this.width = 1;
                return;
        }
    }

}
module.exports = Ship