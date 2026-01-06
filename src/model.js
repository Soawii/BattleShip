import { Gameboard, GameboardConfig } from "./gameboard";
import { Player } from "./player";
import { Ship } from "./ship";
import { EventBus } from "./eventbus";
import { StateManager } from "./statemanager";

export class Model {
    constructor() {
        this.player1 = new Player(1, false, new Gameboard([]));
        this.player2 = new Player(2, true,  new Gameboard([]));

        StateManager.addEnterCallback(StateManager.STATES.BOARD_CHOICE, () => {
            this.player1.turn = 1;
            this.player2.turn = 1;
            this.player1.gameboard.reset();
            this.player2.gameboard.reset();
            EventBus.publish("refresh", this);
        });
        StateManager.addLeaveCallback(StateManager.STATES.BOARD_CHOICE, () => {
            this.randomizeGameboard(2, new GameboardConfig([4, 3, 2, 1]));
            EventBus.publish("refresh", this);
        });

        window.addEventListener("resize", () => {
            EventBus.publish("refresh", this);
        });

        EventBus.subscribe("randomize", () => {
            this.randomizeGameboard(1, new GameboardConfig([4, 3, 2, 1]));
            EventBus.publish("refresh", this);
        });

        EventBus.subscribe("is-possible-to-move", ({id, position}) => {
            return this.player1.gameboard.isPossibleToMoveShip(id, position);
        });
        EventBus.subscribe("is-possible-to-rotate", (id) => {
            return this.player1.gameboard.isPossibleToRotateShip(id);
        });

        EventBus.subscribe("move", ({id, position}) => {
            this.player1.gameboard.moveShip(id, position);
        });
        EventBus.subscribe("rotate", (id) => {
            this.player1.gameboard.rotateShip(id);
            EventBus.publish("refresh", this);
        });

        EventBus.subscribe("get-position", (id) => {
            return this.player1.gameboard.getShipPosition(id);
        });

        EventBus.subscribe("select_player1", ({i, j}) => {
            StateManager.changeState(StateManager.STATES.PLAYER2_TURN);

            this.player1.turn += 1;
            this.hit(1, [j, i]);

            if (this.player2.gameboard.areAllShipsDestroyed()) {
                EventBus.publish("gameover", this.player1);
                return;
            }

            EventBus.publish("remove-board-callback", {i, j});
            EventBus.publish("refresh", this);

            setTimeout(() => {
                const chosen_hit = this.player2.selectHit(this.player1.gameboard);
                EventBus.publish("select_player2", {i: chosen_hit[0], j: chosen_hit[1]});
            }, 100 + Math.random() * 400);
        });

        EventBus.subscribe("select_player2", ({i, j}) => {
            StateManager.changeState(StateManager.STATES.PLAYER1_TURN);

            this.player2.turn += 1;
            this.hit(2, [j, i]);

            if (this.player1.gameboard.areAllShipsDestroyed()) {
                EventBus.publish("gameover", this.player2);
                return;
            }

            EventBus.publish("refresh", this);
        });
    }

    randomizeGameboard(player_number, config) {
        const gameboard = (player_number === 1) ? this.player1.gameboard : this.player2.gameboard;
        gameboard.randomize(new GameboardConfig(config.ship_amount.slice()));
    }

    hit(player_number, position) {
        let gameboard = (player_number === 1) ? this.player2.gameboard : this.player1.gameboard;
        gameboard.hit(position);
    }
}