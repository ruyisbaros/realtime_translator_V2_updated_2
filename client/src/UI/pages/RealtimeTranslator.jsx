import { useState, useEffect } from "react";
import ContentCenter from "../components/realTimeTranslatorComps/ContentCenter";

import LeftSidebar from "../components/realTimeTranslatorComps/LeftSidebar";
import RightSidebar from "../components/realTimeTranslatorComps/RightSidebar";
import { useDispatch, useSelector } from "react-redux";
import { setActiveAppRdx } from "../redux/activeAppSlicer";
import { useWebSocket } from "../WebSocketContext";

const TheCenterContent = () => {
  const dispatch = useDispatch();
  const { active_app } = useSelector((store) => store.activeApp);
  const { socket } = useWebSocket();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (active_app !== "realtime-translator") {
      dispatch(setActiveAppRdx("realtime-translator"));
    }
    socket.emit("define-active-app", { active_app: "realtime-translator" });
  }, [dispatch, active_app, socket]);
  return (
    <div className=" h-[660px] flex items-center justify-center gap-1">
      <LeftSidebar setIsScanning={setIsScanning} />
      <ContentCenter isScanning={isScanning} setIsScanning={setIsScanning} />
      <RightSidebar />
    </div>
  );
};

export default TheCenterContent;
