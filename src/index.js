import "./index.css";
import { Gameboard, GameboardConfig} from "./gameboard";
import { EventBus } from "./eventbus";
import { Model } from "./model";
import { View } from "./view";
import { StateManager } from "./statemanager";

StateManager.init();
const view = new View();
const model = new Model();
model.randomizeGameboard(1, new GameboardConfig([4, 3, 2, 1]));

StateManager.changeState(StateManager.STATES.BOARD_CHOICE);