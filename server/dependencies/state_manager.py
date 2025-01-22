from asyncio import Lock


class StateManager:
    """
    A centralized state manager for the application.
    """

    def __init__(self):
        self._state = "idle"  # Initial state
        self._lock = Lock()  # For thread-safe updates

    async def get_state(self) -> str:
        """
        Get the current state.
        """
        async with self._lock:
            return self._state

    async def set_state(self, new_state: str):
        """
        Set a new state.
        """
        async with self._lock:
            self._state = new_state
            print(f"State updated to: {self._state}")
