import "./styles.css";
const D3Checkbox = () => {
  return (
    <div className=" border_thin w-[200px] h-[50px] mx-auto my-2 flex items-center justify-center">
      <div className="d3_checkbox">
        <input type="checkbox" />
        <div>
          <div className="switch">
            <div className="line"></div>
          </div>
          <div className="shadow"></div>
          <div className="d3_light"></div>
        </div>
      </div>
    </div>
  );
};

export default D3Checkbox;
