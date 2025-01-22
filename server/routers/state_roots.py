from fastapi import APIRouter, Depends
from dependencies.state_manager import StateManager, get_state_manager

router = APIRouter()


@router.get("/state")
async def read_state(state_manager: StateManager = Depends(get_state_manager)):
    """
    Get the current state.
    """
    state = await state_manager.get_state()
    return {"current_state": state}


@router.post("/state")
async def update_state(new_state: str, state_manager: StateManager = Depends(get_state_manager)):
    """
    Update the current state.
    """
    await state_manager.set_state(new_state)
    return {"message": "State updated"}
