import TopBar from "../components/TopBar"
import UserCard from "../components/Dashboard/UserCard"
import SharedBoards from "../components/Dashboard/SharedBoards"
import PersonalBoards from "../components/Dashboard/PersonalBoards"
import RecentBoards from "../components/Dashboard/RecentBoards"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { toast } from "react-toastify"

const Dashboard = () => {

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            toast.error("Session expired. Please log in again.", {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/signup", { replace: true });
        }
    }, [token, navigate]);
    if (!token) return null;

    return (
        <div className="min-h-screen flex flex-col bg-[#F0EFEF]"> {/* root full height flex column */}
            {/* Top bar fixed height */}
            <TopBar />

            {/* Content area fills remaining space and allows children to control overflow */}
            <div className="flex flex-col md:flex-row  flex-1 min-h-0 gap-4 px-4 pb-4"> {/* min-h-0 is key to enable inner overflows */}
                {/* Sidebar */}
                <aside className="flex flex-col md:w-80 lg:w-96 h-full min-h-0">
                    {/* scrollable column container */}
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden pb-3">
                        <UserCard />
                        <RecentBoards />
                    </div>
                </aside>


                {/* Main content */}
                <main className="flex flex-1 min-w-0  min-h-0 gap-4 px-4 pb-4">
                    <div className="flex-1 min-h-0 overflow-auto me-1"> 
                        <PersonalBoards />
                        <SharedBoards />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Dashboard
