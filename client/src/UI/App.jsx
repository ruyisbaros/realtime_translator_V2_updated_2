import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RealtimeTranslator from "./pages/RealtimeTranslator";
import VideoSubtitleCreator from "./pages/VideoSubtitleCreator";
import { useState } from "react";
import MainSidebar from "./components/MainSidebar";

const App = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  };
  return (
    <div className="w-[1200px] max-h-[800px] bg-primary_d shadow-lg rounded-2xl overflow-hidden">
      <ToastContainer
        position="top-right"
        hideProgressBar={false}
        draggable={true}
        pauseOnHover={true}
        limit={3}
        closeOnClick={true}
      />
      ;
      <Header />
      <div className="flex w-full overflow-hidden max-h-[670px] ">
        <MainSidebar
          toggleSidebar={toggleSidebar}
          isSidebarExpanded={isSidebarExpanded}
        />

        <div className="flex-grow overflow-hidden">
          <AnimatePresence>
            <Routes location={location} key={location.key}>
              <Route
                path="/"
                element={
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                  >
                    <Home />
                  </motion.div>
                }
              />
              <Route
                path="/realtime-translator"
                element={
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                  >
                    <RealtimeTranslator />
                  </motion.div>
                }
              />
              <Route
                path="/video-subtitle-creator"
                element={
                  <motion.div
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                  >
                    <VideoSubtitleCreator />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default App;
