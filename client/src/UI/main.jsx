import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./socketIOClient.jsx";
import { setDynamicCSP } from "./csp.js";

setDynamicCSP();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <SocketProvider wsUrl="http://127.0.0.1:8000">
        <App />
      </SocketProvider>
    </Provider>
  </BrowserRouter>
);
