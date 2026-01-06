import { EventBus } from "./eventbus";
import { StateManager } from "./statemanager";

export class View {
    constructor() {
        this.global_modal = null;
        this.modal_div = document.getElementById("modal-div");
        this.modal_backdrop = document.getElementById("modal-backdrop");

        const modal_gameover = document.getElementById("modal-gameover");
        const modal_gameover_ok = document.getElementById("modal-gameover-ok");
        const modal_gameover_info = document.getElementById("modal-gameover-info");

        const button_info = document.getElementById("button-info");
        const modal_info = document.getElementById("modal-info");
        const modal_info_ok = document.getElementById("modal-info-ok");

        const board_play = document.getElementById("board-play");
        const button_play = document.querySelector("#board-play > button");

        const board1 = document.querySelector("#board-1 .board");
        const board2 = document.querySelector("#board-2 .board");
        const board1_ships = document.querySelector("#board-1 .board-ships");
        const board2_ships = document.querySelector("#board-2 .board-ships");
        const board1_hits = document.querySelector("#board-1 .board-hits");
        const board2_hits = document.querySelector("#board-2 .board-hits");
        const player1_name = document.querySelector("#board-1 .board-info-player");
        const player2_name = document.querySelector("#board-2 .board-info-player");
        const player1_turn = document.querySelector("#board-1 .board-info-turn");
        const player2_turn = document.querySelector("#board-2 .board-info-turn");
        const button_randomize = document.getElementById("board-randomize");

        const start_rect = board1.getBoundingClientRect(); 
        const start_bordersize = 1;
        const start_tilesize = (start_rect.width - 11 * start_bordersize) / 10;

        const board1_tiles = [];
        const board2_tiles = [];
        const board2_eventlisteners = [];
        const board1_allhits = [];
        const board2_allhits = [];
        for (let i = 0; i < 10; i++) {
            board1_tiles.push([]);
            board2_tiles.push([]);
            board2_eventlisteners.push([]);
            board1_allhits.push([]);
            board2_allhits.push([]);
        }
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                board1_tiles[i].push(document.querySelector(`#board-1 td[data-y="${i+1}"][data-x="${j+1}"] > div.tile`));
                board2_tiles[i].push(document.querySelector(`#board-2 td[data-y="${i+1}"][data-x="${j+1}"] > div.tile`));
                board2_eventlisteners[i].push(() => {
                    if (StateManager.state !== StateManager.STATES.PLAYER1_TURN) {
                        return;
                    }
                    EventBus.publish("select_player1", {i, j});
                });
                const hit_div = document.createElement("div");
                hit_div.classList.add("hit");
                board1_allhits[i].push(hit_div.cloneNode());
                board2_allhits[i].push(hit_div.cloneNode());
                board1_hits.appendChild(board1_allhits[i][j]);
                board2_hits.appendChild(board2_allhits[i][j]);
            }
        }

        button_play.addEventListener("click", () => {
            board_play.style.display = "none";
            StateManager.changeState(StateManager.STATES.PLAYER1_TURN);
        });
        
        button_randomize.addEventListener("click", () => {
            EventBus.publish("randomize");
        });

        this.modal_backdrop.addEventListener("click", () => {
            if (this.global_modal === modal_gameover)
                return;
            this.closeModal();
        });
        modal_gameover_ok.addEventListener("click", () => {
            this.closeModal();
            StateManager.changeState(StateManager.STATES.BOARD_CHOICE);
        });
        modal_info_ok.addEventListener("click", () => {
            this.closeModal();
        });

        button_info.addEventListener("click", () => {
            this.openModal(modal_info);
        });

        StateManager.addEnterCallback(StateManager.STATES.BOARD_CHOICE, () => {
            for (let i = 0; i < board2_tiles.length; i++) {
                for (let j = 0; j < board2_tiles[i].length; j++) {
                    board2_tiles[i][j].removeEventListener("click", board2_eventlisteners[i][j]);
                    board2_tiles[i][j].addEventListener("click", board2_eventlisteners[i][j]);
                    board1_allhits[i][j].removeAttribute("visible");
                    board2_allhits[i][j].removeAttribute("visible");
                }
            }
            board_play.style.display = "block";
            player1_name.style.color = "black";
            player2_name.style.color = "black";
            button_randomize.removeAttribute("disabled");
        });
        StateManager.addLeaveCallback(StateManager.STATES.BOARD_CHOICE, () => {
            button_randomize.setAttribute("disabled", "");
        });
        StateManager.addEnterCallback(StateManager.STATES.PLAYER1_TURN, () => {
            for (let i = 0; i < board2_tiles.length; i++) {
                for (let j = 0; j < board2_tiles[i].length; j++) {
                    board2_tiles[i][j].setAttribute("selectable", "");
                }
            }
            player1_name.style.color = "red";
            player2_name.style.color = "black";
        });
        StateManager.addEnterCallback(StateManager.STATES.PLAYER2_TURN, () => {
            for (let i = 0; i < board2_tiles.length; i++) {
                for (let j = 0; j < board2_tiles[i].length; j++) {
                    board2_tiles[i][j].removeAttribute("selectable");
                }
            }
            player1_name.style.color = "black";
            player2_name.style.color = "red";
        });

        EventBus.subscribe("remove-board-callback", ({i, j}) => {
            board2_tiles[i][j].removeEventListener("click", board2_eventlisteners[i][j]);
        });

        EventBus.subscribe("refresh", (model) => {
            player1_turn.innerHTML = `Turn ${model.player1.turn}`;
            player2_turn.innerHTML = `Turn ${model.player2.turn}`;

            while (board1_ships.firstChild) board1_ships.removeChild(board1_ships.firstChild);
            while (board2_ships.firstChild) board2_ships.removeChild(board2_ships.firstChild);
            //while (board1_hits.firstChild) board1_hits.removeChild(board1_hits.firstChild);
            //while (board2_hits.firstChild) board2_hits.removeChild(board2_hits.firstChild);

            const rect = board1.getBoundingClientRect(); 
            const bordersize = 1;
            const tilesize = (rect.width - 11 * bordersize) / 10;

            for (const s of model.player1.gameboard.ships) {
                const ship_div = document.createElement("div");
                ship_div.classList.add("ship");
                ship_div.dataset.id = s.id;
                if (StateManager.state == StateManager.STATES.BOARD_CHOICE) {
                    ship_div.setAttribute("movable", "");
                }
                
                const bigSize = tilesize * s.ship_len + bordersize * (s.ship_len - 1);
                if (s.to_right) {
                    ship_div.style.width = `${bigSize}px`;
                    ship_div.style.height = `${tilesize}px`;
                }
                else {
                    ship_div.style.width = `${tilesize}px`;
                    ship_div.style.height = `${bigSize}px`;
                }

                ship_div.style.left = `${s.position[0] * tilesize + (s.position[0] + 1) * bordersize}px`;
                ship_div.style.top = `${s.position[1] * tilesize + (s.position[1] + 1) * bordersize}px`;

                board1_ships.appendChild(ship_div);
            }

            for (const a of model.player1.gameboard.hits) {
                const hit = board1_allhits[a.position[1]][a.position[0]];
                hit.style.width = `${tilesize}px`;
                hit.style.height = `${tilesize}px`;
                hit.style.left = `${a.position[0] * tilesize + (a.position[0] + 1) * bordersize}px`;
                hit.style.top = `${a.position[1] * tilesize + (a.position[1] + 1) * bordersize}px`;
                if (!hit.hasAttribute("visible")) {
                    hit.setAttribute("visible", "");
                }
                if (a.is_hit) {
                    hit.setAttribute("hit", "");
                }
                else {
                    hit.removeAttribute("hit");
                }
            }

            for (const s of model.player2.gameboard.ships) {
                if (!s.isDestroyed())
                    continue;

                const ship_div = document.createElement("div");
                ship_div.classList.add("ship");
                ship_div.dataset.id = s.id;
                if (StateManager.state == StateManager.STATES.BOARD_CHOICE) {
                    ship_div.setAttribute("movable", "");
                }
                
                const bigSize = tilesize * s.ship_len + bordersize * (s.ship_len - 1);
                if (s.to_right) {
                    ship_div.style.width = `${bigSize}px`;
                    ship_div.style.height = `${tilesize}px`;
                }
                else {
                    ship_div.style.width = `${tilesize}px`;
                    ship_div.style.height = `${bigSize}px`;
                }

                ship_div.style.left = `${s.position[0] * tilesize + (s.position[0] + 1) * bordersize}px`;
                ship_div.style.top = `${s.position[1] * tilesize + (s.position[1] + 1) * bordersize}px`;

                board2_ships.appendChild(ship_div);
            }

            for (const a of model.player2.gameboard.hits) {
                const hit = board2_allhits[a.position[1]][a.position[0]];
                hit.style.width = `${tilesize}px`;
                hit.style.height = `${tilesize}px`;
                hit.style.left = `${a.position[0] * tilesize + (a.position[0] + 1) * bordersize}px`;
                hit.style.top = `${a.position[1] * tilesize + (a.position[1] + 1) * bordersize}px`;
                if (!hit.hasAttribute("visible")) {
                    hit.setAttribute("visible", "");
                }
                if (a.is_hit) {
                    hit.setAttribute("hit", "");
                }
                else {
                    hit.removeAttribute("hit");
                }
            }
        });

        this.activeShip = null;
        this.activeShipPos = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.moved = false;

        document.addEventListener('pointerdown', e => {
            if (StateManager.state != StateManager.STATES.BOARD_CHOICE)
                return;
            const ship = e.target.closest('#board-1 .ship');
            if (!ship) 
                return;
            ship.setPointerCapture(e.pointerId);

            this.activeShip = ship;
            ship.classList.add('dragging');

            this.activeShipPos = EventBus.publish('get-position', Number(ship.dataset.id))[0].slice();

            const rect = ship.getBoundingClientRect();
            this.offsetX = e.clientX - rect.left;
            this.offsetY = e.clientY - rect.top;
            this.moved = false;
        });

        document.addEventListener('pointermove', e => {
            if (StateManager.state != StateManager.STATES.BOARD_CHOICE)
                return;
            if (!this.activeShip) return;

            this.moved = true;

            const rect = board1.getBoundingClientRect(); 
            const bordersize = 1;
            const tilesize = (rect.width - 11 * bordersize) / 10;

            let newpos = [e.clientX - this.offsetX - rect.left, e.clientY - this.offsetY - rect.top];
            const newgridpos = [
                Math.floor(0.5 + (newpos[0] - bordersize) / (tilesize + bordersize)),
                Math.floor(0.5 + (newpos[1] - bordersize) / (tilesize + bordersize))
            ];
            newgridpos[0] = Math.max(0, Math.min(newgridpos[0], 9));
            newgridpos[1] = Math.max(0, Math.min(newgridpos[1], 9));

            const is_snapping = EventBus.publish("is-possible-to-move", { 
                                    id: Number(this.activeShip.dataset.id), 
                                    position: newgridpos
                                })[0];

            if (is_snapping) {
                newpos = [
                    newgridpos[0] * tilesize + (newgridpos[0] + 1) * bordersize,
                    newgridpos[1] * tilesize + (newgridpos[1] + 1) * bordersize
                ];

                if (!this.activeShip.classList.contains("snapping")) {
                    this.activeShip.classList.add("snapping");
                }
            }
            else if (this.activeShip.classList.contains("snapping")) {
                this.activeShip.classList.remove("snapping");
            }
            
            this.activeShip.style.left = `${newpos[0]}px`;
            this.activeShip.style.top  = `${newpos[1]}px`;
        });

        document.addEventListener('pointerup', e => {
            if (StateManager.state != StateManager.STATES.BOARD_CHOICE)
                return;
            if (!this.activeShip) return;

            if (!this.moved) {
                const is_rotating = EventBus.publish("is-possible-to-rotate", Number(this.activeShip.dataset.id))[0];
                if (is_rotating) {
                    EventBus.publish('rotate', Number(this.activeShip.dataset.id));
                }
                else {
                    this.activeShip.classList.add("error");
                    const ship = this.activeShip;
                    setTimeout(() => {
                        ship.classList.remove("error");
                    }, 500);
                }
            }

            this.activeShip.classList.remove('dragging');
            if (this.activeShip.classList.contains('snapping')) {
                this.activeShip.classList.remove('snapping');
            }
            this.activeShip.releasePointerCapture(e.pointerId);

            const rect = board1.getBoundingClientRect(); 
            const bordersize = 1;
            const tilesize = (rect.width - 11 * bordersize) / 10;

            let newpos = [e.clientX - this.offsetX - rect.left, e.clientY - this.offsetY - rect.top];
            let newgridpos = [
                Math.floor(0.5 + (newpos[0] - bordersize) / (tilesize + bordersize)),
                Math.floor(0.5 + (newpos[1] - bordersize) / (tilesize + bordersize))
            ];
            newgridpos[0] = Math.max(0, Math.min(newgridpos[0], 9));
            newgridpos[1] = Math.max(0, Math.min(newgridpos[1], 9));

            const is_snapping = EventBus.publish("is-possible-to-move", { 
                                    id: Number(this.activeShip.dataset.id), 
                                    position: newgridpos
                                })[0];

            if (is_snapping) {
                EventBus.publish('move', {id: Number(this.activeShip.dataset.id), position: newgridpos});
            }
            else {
                newgridpos = this.activeShipPos.slice();
                this.activeShip.classList.add("error");
                const ship = this.activeShip;
                setTimeout(() => {
                    ship.classList.remove("error");
                }, 500);
            }

            newpos = [
                newgridpos[0] * tilesize + (newgridpos[0] + 1) * bordersize,
                newgridpos[1] * tilesize + (newgridpos[1] + 1) * bordersize
            ];
            this.activeShip.style.left = `${newpos[0]}px`;
            this.activeShip.style.top  = `${newpos[1]}px`;

            this.activeShip = null;
            this.activeShipPos = null;
        });

        EventBus.subscribe("gameover", (player) => {
            StateManager.changeState(StateManager.STATES.GAMEOVER);
            while (modal_gameover_info.firstChild) modal_gameover_info.removeChild(modal_gameover_info.firstChild);
            const first_info = document.createElement("div");
            first_info.textContent = `Player ${player.id} has won in ${player.turn} turns!`;
            const second_info = document.createElement("div");
            second_info.textContent = `Start another game by clicking "Play"`;
            modal_gameover_info.append(first_info, second_info);

            this.openModal(modal_gameover);
        });
    }

    openModal(modal) {
        if (this.global_modal !== null)
            return;
        this.global_modal = modal;
        this.modal_backdrop.setAttribute("open", "");
        this.modal_div.setAttribute("open", "");
        this.global_modal.setAttribute("open", "");
    }

    closeModal() {
        this.modal_backdrop.removeAttribute("open");
        this.modal_div.removeAttribute("open");
        this.global_modal.removeAttribute("open");
        this.global_modal = null;
    }
}