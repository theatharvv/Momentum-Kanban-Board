import { useNavigate } from "react-router-dom";
import logo from "../images/ClearLogo.png"
import OrangeButton from "./Buttons/OrangeButton"
import { toast } from "react-toastify";

const TopBar = () => {

  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    toast.success("Signed out successfully!");
    navigate("/signin");
  };

  return (
    <header className="flex w-full h-[4rem] px-4 bg-white items-center justify-between shadow-md">
      <div className="flex items-center h-full">
        <img src={logo} alt="topBar-logo" className="h-[3rem] w-auto" />
      </div>
      <OrangeButton label={"Log out"} onClick={handleSignOut} />
    </header>
  )
}

export default TopBar
