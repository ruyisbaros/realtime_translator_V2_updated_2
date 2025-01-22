import Modal from "react-modal";

// eslint-disable-next-line react/prop-types
const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      contentLabel="Confirmation"
      ariaHideApp={false} // Only needed if you're not setting app root
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0,0,0,.5",
          borderRadius: "10px",
          padding: "24px",
          maxWidth: "400px",
          fontFamily: "Arial, sans-serif",
          color: "#fff",
        },
      }}
    >
      <h3 className="italic font-bold text-[#30f4d6] text-center mb-3">
        Are you sure?
      </h3>
      <p className="text-white text-center font-bold">
        All progress will be reset if you stop the operation.
      </p>
      <div className="flex justify-center items-center gap-6 mt-4">
        <button
          onClick={onConfirm}
          className="text-[16px] text-white bg-[#30f4d6] p-2 rounded-md font-bold shadow-xl"
        >
          Yes, Stop
        </button>
        <button
          onClick={onCancel}
          className="text-[16px] text-white bg-[#d61102] p-2 rounded-md font-bold shadow-xl"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
