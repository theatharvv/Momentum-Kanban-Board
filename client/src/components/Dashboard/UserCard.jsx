import { useEffect, useState } from "react";
import OrangeButton from "../Buttons/OrangeButton";
import EditProfileModal from "./EditProfileModal";
import axios from "axios";
import { toast } from "react-toastify";

const UserCard = () => {
    const token = localStorage.getItem("token");
    const [user, setUser] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/v1/profile/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUser();
    }, [token]); // you can use [] if token doesn't change dynamically

    const handleProfileEdit = (userNew) => {
        setUser(userNew);
        toast.success(`Profile edited successfully`)
    };

    const pfp = user.profilePic;
    const fallback = "http://localhost:5000/uploads/default.png";

    const needsFallback =
        !pfp || String(pfp).trim() === "" || String(pfp).trim().toLowerCase() === "default";

    const profilePicture = needsFallback ? fallback : pfp;

    return (
        <div className="mx-2 my-3 rounded-xl bg-white flex flex-col items-center justify-center p-3 shadow-sm">
            <div
                style={{ backgroundImage: `url(${profilePicture})`, backgroundSize: "cover", backgroundPosition: "center" }}
                className="h-40 w-40 rounded-full mb-4 border-4 shadow-md border-[#e95e19]"
            ></div>

            <p className="text-2xl font-roboto">{user.name}</p>
            <p className="text-sm font-roboto text-gray-700">{user.email}</p>

            <div className="pt-2">
                <OrangeButton
                    label="Edit profile"
                    onClick={() => setIsModalOpen(true)}
                />
            </div>

            <EditProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProfileEdited={handleProfileEdit}
            />
        </div>
    );
};

export default UserCard;
