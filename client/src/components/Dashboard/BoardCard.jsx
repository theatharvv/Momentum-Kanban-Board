import axios from "axios";
import { toast } from "react-toastify";

const BoardCard = ({ title, background, members = 1, id, onDelete }) => {
  const fallback = "http://localhost:5000/uploads/default.png";
  const token = localStorage.getItem("token");

  const needsFallback =
    !background ||
    String(background).trim() === "" ||
    String(background).trim().toLowerCase() === "default";

  const bg = needsFallback ? fallback : background;

  const handleOnDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Board ${title} deleted successfully`)
      // Call parent callback if provided so UI updates
      if (onDelete) onDelete(id);

    } catch (error) {
      console.log(id);
      console.error("❌ Error deleting board:", error);
      toast.error("Failed to delete board. Check console for details.");
    }
  };

  return (
    <div className="h-48 w-48 rounded-2xl border-4 border-slate-200 overflow-hidden hover:scale-105 hover:shadow-lg ms-2 mt-2 mb-3">
      <div
        className="h-[74%] border-b-4 border-[#e95e19] bg-cover bg-center flex items-start justify-end"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <button
          className="text-slate-300 hover:text-red-600 hover:text-3xl text-xl font-bold pe-2"
          onClick={handleOnDelete}
        >
          ×
        </button>
      </div>
      <div className="bg-[#e95e19] w-full h-auto">
        <p className="font-semibold font-ibmPlexSans ps-2 text-white">{title}</p>
        <p className="text-[12px] font-medium font-ibmPlexSans px-2 pb-2 text-white">
          {members} {members === 1 ? "member" : "members"}
        </p>
      </div>
    </div>
  );
};

export default BoardCard;
