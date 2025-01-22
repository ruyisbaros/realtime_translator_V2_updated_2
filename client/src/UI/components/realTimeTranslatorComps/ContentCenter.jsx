import ContentCenterDown from "./ContentCenterDown";
import ContentCenterUp from "./ContentCenterUp";

// eslint-disable-next-line react/prop-types
const ContentCenter = ({ isScanning, setIsScanning }) => {
  return (
    <div className="bg-primary QPushButton h-[640px] w-[44%] flex flex-col justify-between ">
      <div className=" h-full text-white bg-primary">
        <ContentCenterUp
          isScanning={isScanning}
          setIsScanning={setIsScanning}
        />
        <ContentCenterDown />
      </div>
    </div>
  );
};

export default ContentCenter;
