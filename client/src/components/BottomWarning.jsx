import { useNavigate } from "react-router-dom";

const BottomWarning = ({ label, buttonText, to }) => {
  const navigate = useNavigate();

  return (
    <div className="ps-3 pb-2 flex font-ibmPlexSans">
      <p className="text-lg">{label}</p>
      <button
        type="button"
        className="mx-1 text-sm underline hover:text-[#F26E2D]"
        onClick={() => navigate(to)}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default BottomWarning;
