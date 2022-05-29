class Ship {
    constructor(type, position) {
        this.type = type;
        this.position = position;
        this.destroyed = false;
    }


    set setType(type) {
        this.type = type;
        this.shipSize(type);
        this.changeShape();
    }

    changeShape(width = this.width, len = this.len) {
        if (width && len !== null) {
            // create array for 
            this.position = Array.from(Array(len * width), () => Uint8Array(2));
        }
    }

    changePosition(arrayOfPoints) {
        // for change position create empty array
        this.position = Array.from(Array(this.len * this.width), () => Uint8Array(2));
        this.position.push(arrayOfPoints);
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