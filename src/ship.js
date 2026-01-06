export class Ship {
    constructor(ship_len, position, to_right, id) {
        this.ship_len = ship_len;
        this.position = position;
        this.to_right = to_right;
        this.hp = ship_len;
        this.id = id;
    }

    doesInclude(position) {
        if (this.to_right) {
            const pd = position[0] - this.position[0];
            return position[1] === this.position[1] && (pd >= 0 && pd < this.ship_len);
        }
        const pd = position[1] - this.position[1];
        return position[0] === this.position[0] && (pd >= 0 && pd < this.ship_len);
    }

    getPositions() {
        let positions = [];

        if (this.to_right) {
            for (let i = this.position[0]; i < this.position[0] + this.ship_len; i++) {
                positions.push([i, this.position[1]]);
            }
        }
        else {
            for (let i = this.position[1]; i < this.position[1] + this.ship_len; i++) {
                positions.push([this.position[0], i]);
            }
        }

        return positions;
    }

    isDestroyed() {
        return this.hp === 0;
    }
}