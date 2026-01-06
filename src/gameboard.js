import { Ship } from "./ship.js";

export class GameboardConfig {
    constructor(ship_amount) {
        // [4, 3, 2, 1] -> 4 ships of length 1, 3 of length 2 etc.
        this.ship_amount = ship_amount;
    }
}

export class Gameboard {
    constructor(ships = []) {
        this.ships = ships;
        this.hits = [];
    }

    reset() {
        this.hits = [];
        for (const s of this.ships) {
            s.hp = s.ship_len;
        }
    }

    hit(position) {
        let is_hit = false;
        for (let s of this.ships) {
            const positions = s.getPositions();
            for (const p of positions) {
                if (position[0] == p[0] && position[1] == p[1]) {
                    s.hp -= 1;
                    is_hit = true;
                    break;
                }
            }
            if (is_hit)
                break;
        }

        this.hits.push({
            is_hit,
            position
        });
    }

    areAllShipsDestroyed() {
        for (const s of this.ships) {
            if (!s.isDestroyed())
                return false;
        }
        return true;
    }
    
    randomize(config) {
        this.ships = [];
        this.#randomize_helper(config);
    }

    #randomize_helper(config) {
        let ship_len = 0;
        for (let s_len = config.ship_amount.length - 1; s_len >= 0; s_len--) {
            if (config.ship_amount[s_len] > 0) {
                ship_len = s_len + 1;
                break;
            }
        }

        if (ship_len <= 0)
            return true;

        const new_ship_id = this.getMaxShipId() + 1;

        const valid_states = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.ships.push(new Ship(ship_len, [j, i], true, new_ship_id));
                if (this.isValidState()) {
                    valid_states.push([i, j, true]);
                }
                this.ships.pop();

                if (ship_len > 1) {
                    this.ships.push(new Ship(ship_len, [j, i], false, new_ship_id));
                    if (this.isValidState()) {
                        valid_states.push([i, j, false]);
                    }
                    this.ships.pop();
                }
            }
        }

        while (true) {
            if (valid_states.length == 0)
                return false;

            const chosen_state_idx = Math.floor(Math.random() * valid_states.length);
            const chosen_state = valid_states[chosen_state_idx];

            this.ships.push(new Ship(ship_len, [chosen_state[1], chosen_state[0]], chosen_state[2], new_ship_id));
            config.ship_amount[ship_len - 1] = config.ship_amount[ship_len - 1] - 1;
            if (this.#randomize_helper(config)) {
                config.ship_amount[ship_len - 1] = config.ship_amount[ship_len - 1] + 1;
                return true;
            }
            else {
                valid_states.splice(chosen_state_idx, 1);
                config.ship_amount[ship_len - 1] = config.ship_amount[ship_len - 1] + 1;
                this.ships.pop();
            }
        }
    }

    getBoard() {
        let board = [];
        for (let i = 0; i < 10; i++) {
            board.push([]);
            for (let j = 0; j < 10; j++) {
                board[i].push(0);
            }
        }

        for (let s of this.ships) {
            const s_positions = s.getPositions();
            for (let p of s_positions) {
                board[p[1]][p[0]] = s.id;
            }
        }

        return board;
    }

    isValidState() {
        const board = [];
        for (let i = 0; i < 10; i++) {
            board.push([]);
            for (let j = 0; j < 10; j++) {
                board[i].push(0);
            }
        }

        for (let s of this.ships) {
            let s_positions = s.getPositions();
            for (const p of s_positions) {
                if (p[0] < 0 || p[1] < 0 || p[0] >= 10 || p[1] >= 10)
                    return false;
                if (board[p[1]][p[0]] != 0)
                    return false;
                board[p[1]][p[0]] = s.id;
                for (let di = -1; di <= 1; di++) {
                    for (let dj = -1; dj <= 1; dj++) {
                        if (di == 0 && dj == 0)
                            continue;
                        const new_i = p[1] + di;
                        const new_j = p[0] + dj;
                        if (new_i < 0 || new_j < 0 || new_i >= 10 || new_j >= 10)
                            continue;
                        if (board[new_i][new_j] != 0 && board[new_i][new_j] != board[p[1]][p[0]]) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    }

    isPossibleToMoveShip(id, new_pos) {
        const new_ships = [];
        for (const s of this.ships) {
            new_ships.push(new Ship(s.ship_len, s.id === id ? new_pos.slice() : s.position, s.to_right, s.id));
        }
        const new_gameboard = new Gameboard(new_ships);
        return new_gameboard.isValidState();
    }

    isPossibleToRotateShip(id) {
        const new_ships = [];
        for (const s of this.ships) {
            new_ships.push(new Ship(s.ship_len, s.position, s.id === id ? !s.to_right : s.to_right, s.id));
        }
        const new_gameboard = new Gameboard(new_ships);
        return new_gameboard.isValidState();
    }

    moveShip(id, new_position) {
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].id == id) {
                this.ships[i].position = new_position.slice();
                return;
            }
        }
    }

    rotateShip(id) {
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].id == id) {
                this.ships[i].to_right = !this.ships[i].to_right;
                return;
            }
        }
    }

    getShipPosition(id) {
        for (let i = 0; i < this.ships.length; i++) {
            if (this.ships[i].id == id) {
                return this.ships[i].position.slice();
            }
        }
    }

    getMaxShipId() {
        let max = 0;
        for (const s of this.ships) {
            if (s.id > max)
                max = s.id;
        }
        return max;
    }
}