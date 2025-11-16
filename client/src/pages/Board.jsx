import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import TopBar from "../components/TopBar";
import BoardAuditLogs from "../components/Board/BoardAuditLogs";
import BoardMembers from "../components/Board/BoardMembers";
import KanbanColumn from "../components/Board/KanbanColumn";
import KanbanCard from "../components/Board/KanbanCard";

const Board = () => {
    const location = useLocation();
    const { boardId } = location.state || {};

    const token = localStorage.getItem("token");

    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeCard, setActiveCard] = useState(null);

    const fetchBoard = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/v1/boards/${boardId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setBoard(res.data);
        } catch (err) {
            console.error("Error fetching board data:", err);
        }
    };

    useEffect(() => {
        let mounted = true;

        const loadBoard = async () => {
            await fetchBoard();
            if (mounted) setLoading(false);
        };

        loadBoard();
        return () => {
            mounted = false;
        };
    }, [boardId, token]);

    const handleDragStart = (event) => {
        const { active } = event;
        const card = active.data.current.card;
        setActiveCard(card);
    };

    const handleDragEnd = async (event) => {
        const { over, active } = event;
        setActiveCard(null);

        if (!over) return;

        const fromListId = active.data.current.listId;
        const toListId = over.data.current?.listId;

        console.log('Drag ended:', { fromListId, toListId, cardId: active.id });

        // If dropped in the same list, do nothing
        if (fromListId === toListId) {
            console.log('Same list, ignoring');
            return;
        }

        const cardId = active.id;

        // Optimistic update - update UI immediately
        setBoard((prevBoard) => {
            const newLists = prevBoard.lists.map((list) => {
                if (list._id === fromListId) {
                    return {
                        ...list,
                        cards: list.cards.filter((c) => c._id !== cardId),
                    };
                }
                if (list._id === toListId) {
                    const movedCard = prevBoard.lists
                        .find((l) => l._id === fromListId)
                        ?.cards.find((c) => c._id === cardId);
                    
                    if (!movedCard) {
                        console.error('Card not found!');
                        return list;
                    }
                    
                    return {
                        ...list,
                        cards: [...list.cards, movedCard],
                    };
                }
                return list;
            });

            return { ...prevBoard, lists: newLists };
        });

        // API call to persist the change
        try {
            console.log('Making API call to update card...');
            const response = await axios.put(
                `http://localhost:5000/api/v1/cards/${cardId}`,
                { listId: toListId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log('API response:', response.data);
            
            // Refetch board to sync with database
            console.log('Refetching board...');
            await fetchBoard();
            console.log('Board refetched');
            
        } catch (err) {
            console.error("Error moving card:", err.response?.data || err.message);
            // Revert on error
            await fetchBoard();
        }
    };

    const handleDragCancel = () => {
        setActiveCard(null);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F0EFEF]">
                <p className="text-gray-600 font-ibmPlexSans">Loading board…</p>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#F0EFEF]">
                <p className="text-gray-600 font-ibmPlexSans">
                    Board not found or error loading.
                </p>
            </div>
        );
    }

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            collisionDetection={closestCorners}
        >
            <div className="min-h-screen flex flex-col bg-[#F0EFEF]">
                <TopBar />

                <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 px-4 pb-4">
                    <aside className="flex flex-col md:w-80 lg:w-96 h-full min-h-0">
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden pb-3">
                            <BoardAuditLogs boardId={boardId} />
                            <BoardMembers members={board.members} boardId={boardId} />
                        </div>
                    </aside>

                    <main className="flex flex-1 min-w-0 min-h-0 gap-4 px-4 pb-4">
                        <div className="flex flex-row flex-1 min-h-0 overflow-auto me-1">
                            {board.lists && board.lists.length > 0 ? (
                                board.lists
                                    .sort((a, b) => a.position - b.position)
                                    .map((list) => (
                                        <KanbanColumn
                                            key={list._id}
                                            id={list._id}
                                            title={list.title}
                                            position={list.position}
                                            cards={list.cards || []}
                                            board={board}
                                        />
                                    ))
                            ) : (
                                <p className="text-gray-600">No lists found</p>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            <DragOverlay>
                {activeCard ? (
                    <div className="rotate-3 opacity-80">
                        <KanbanCard
                            cardKey={activeCard._id}
                            card={activeCard}
                            column={null}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default Board;