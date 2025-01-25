# socket_ops/client_manager.py
class ClientManager:
    def __init__(self):
        self._clients = {}

    def register_client(self, sid, client_type, client_id):
        if client_id in self._clients:
            self._clients[client_id]["socketId"] = sid
            print(f"Client reconnected: {self._clients}")
        else:
            self._clients[client_id] = {
                "socketId": sid, "clientType": client_type}
            print(f"New client registered: {self._clients[client_id]}")

    def unregister_client(self, sid):
        for client_id, data in list(self._clients.items()):
            if data["socketId"] == sid:
                del self._clients[client_id]
                print(f"Client removed: {client_id}")
                return

    def get_client_by_id(self, client_id):
        return self._clients.get(client_id)

    def get_client_by_socketid(self, socket_id):
        for client_id, data in self._clients.items():
            if data["socketId"] == socket_id:
                return data
        return None
