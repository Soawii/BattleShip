export class StateManager {
    static STATES = {
        START_STATE:    0,
        BOARD_CHOICE:   1,  
        PLAYER1_TURN:   2, 
        PLAYER2_TURN:   3, 
        GAMEOVER:       4,
        STATE_AMOUNT:   5, 
    };

    static state = this.STATES.START_STATE;

    static enterStateCallbacks = [];
    static leaveStateCallbacks = [];

    static init() {
        for (let i = 0; i < this.STATES.STATE_AMOUNT; i++) {
            this.enterStateCallbacks.push([]);
            this.leaveStateCallbacks.push([]);
        }
    }

    static addEnterCallback(state, callback) {
        this.enterStateCallbacks[state].push(callback);
    }

    static addLeaveCallback(state, callback) {
        this.leaveStateCallbacks[state].push(callback);
    }

    static changeState(state) {
        if (state === this.state) 
            return;
        const old_state = this.state;
        this.state = state;
        
        for (const cb of this.leaveStateCallbacks[Number(old_state)])
            cb();
        for (const cb of this.enterStateCallbacks[Number(state)])
            cb();
    }
}