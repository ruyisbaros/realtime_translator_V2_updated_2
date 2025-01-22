class StateManager {
  constructor() {
    this._state = "idle"; // Default state
    this.listeners = []; // Listeners for state changes
  }

  getState() {
    return this._state;
  }

  updateState(newState) {
    if (this._state !== newState) {
      console.log(`State changed from '${this._state}' to '${newState}'`);
      this._state = newState;
      this.notifyListeners(newState);
    }
  }

  onStateChange(listener) {
    this.listeners.push(listener);
  }

  notifyListeners(newState) {
    this.listeners.forEach((listener) => listener(newState));
  }
}

const stateManager = new StateManager();
module.exports = { stateManager };
