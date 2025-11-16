import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrangeButton from "../Buttons/OrangeButton";
import BoardCard from "./BoardCard";
import CreateBoardModal from "./CreateBoardModal";
import axios from "axios";

const SharedBoards = () => {
  const token = localStorage.getItem("token");
  const [boards, setBoards] = useState([]);
  const navigate = useNavigate(); // add this

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/boards/shared",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBoards(response.data);
      } catch (error) {
        console.error("Error fetching shared boards:", error);
      }
    };
    fetchBoards();
  }, [token]);

  const openBoard = (board) => {
    navigate(`/board`, {
      state: { boardId: board._id }, // send id (and optionally whole board)
      replace: false,
    });
  };

  return (
    <section className="w-full mt-4 rounded-2xl shadow-lg bg-white px-4 pt-4 pb-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold font-ibmPlexSans mb-3 text-gray-800">
          Shared Boards
        </h2>
      </div>

      <div className="w-full max-h-[40vh] overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
        <div className="flex w-max gap-3">
          {boards.length > 0 ? (
            boards.map((board) => (
              <div
                key={board._id}
                role="button"
                tabIndex={0}
                onClick={() => openBoard(board)}
                onKeyDown={(e) => e.key === "Enter" && openBoard(board)}
                className="cursor-pointer"
                aria-label={`Open shared board ${board.title}`}
              >
                <BoardCard
                  id={board._id}
                  title={board.title}
                  background={board.background}
                  members={board.members?.length || 0}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No shared boards found</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default SharedBoards;
