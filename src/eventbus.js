export class EventBus {
    static event_to_callbacks = new Map();
    
    static subscribe(event, callback) {
        const callbacks = EventBus.event_to_callbacks.get(event);
        if (!callbacks) {
            EventBus.event_to_callbacks.set(event, [callback]);
            return;
        }
        callbacks.push(callback);
    }

    static publish(event, data) {
        const return_values = [];
        const callbacks = EventBus.event_to_callbacks.get(event);
        if (!callbacks)
            return [];
        for (let i = 0; i < callbacks.length; i++) {
            return_values.push(callbacks[i](data));
        }
        return return_values;
    }
}