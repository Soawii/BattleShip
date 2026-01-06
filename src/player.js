export class Player {
    constructor(id, is_computer, gameboard) {
        this.id = id;
        this.is_computer = is_computer;
        this.gameboard = gameboard;
        this.turn = 1;
    }

    selectHit(enemyGameboard) {
        const seen = [];
        for (let i = 0; i < 10; i++) {
            seen.push([]);
            for (let j = 0; j < 10; j++) {
                seen[i].push(false);
            }
        }

        for (const h of enemyGameboard.hits) {
            seen[h.position[1]][h.position[0]] = true;
        }

        const freeSpaces = [];

        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (!seen[i][j])
                    freeSpaces.push([i, j]);
            }
        }

        return freeSpaces[Math.floor(Math.random() * freeSpaces.length)];
    }
}