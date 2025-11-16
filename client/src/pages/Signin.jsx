import RightHero from "../components/RightHero";
import logo from "../images/ClearLogo.png";
import InputBox from "../components/InputBox";
import CustomButton from "../components/Buttons/CustomButton";
import SubHeading from "../components/SubHeading";
import Heading from "../components/Heading";
import BottomWarning from "../components/BottomWarning";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Signup = () => {

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            toast.success("Session active, you are already logged in.")
            navigate("/dashboard", { replace: true });
        }
    }, [token, navigate]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="h-screen w-screen flex flex-col md:flex-row items-center justify-between p-6 bg-[#FDFDFD]">

            {/* Left side */}
            <div className="flex flex-col w-full md:w-[40%] h-full mr-0 md:mr-2 bg-[#FDFDFD]">

                {/* Logo */}
                <div className="flex justify-start items-start h-[80px] w-full mb-6">
                    <img src={logo} alt="topBar-logo" className="w-auto h-full" />
                </div>

                {/* Input fields */}
                <div className="pe-5 flex-col justify-start items-start">
                    <Heading label={"Welcome Back!"} />
                    <SubHeading content={"Sign in to continue your journey.."} />
                </div>

                <div className="flex flex-col w-full h-full gap-4 justify-center items-center">

                    <InputBox label="Email" placeholder="Enter your email" onChange={e => {
                        setEmail(e.target.value);
                    }} />

                    <InputBox label="Password" placeholder="Enter your password" type="password" onChange={e => {
                        setPassword(e.target.value);
                    }} />

                    <CustomButton label="Log in"
                        onClick={
                            async () => {

                                try {
                                    const response = await axios.post("http://localhost:5000/api/v1/auth/login", {
                                        email,
                                        password
                                    });

                                    const token = response.data?.token;
                                    if (!token) {
                                        toast.error(
                                            <>No token received from server. Please try again.</>
                                        );
                                        return;
                                    }

                                    localStorage.setItem("token", token);
                                    toast.success("Logged in successfully.")
                                    navigate("/dashboard");

                                } catch (error) {
                                    console.error(error.response?.data || error.message);
                                    toast.error(
                                        <>Signup failed.<br />Reason: {error.response?.data?.message || error.message || "Unknown error"}</>
                                    );
                                }
                            }
                        }
                    />
                    <BottomWarning label="Don’t have an account yet?" buttonText="Create one" to="/signup" />
                </div>

            </div>

            {/* Right side Hero */}
            <div className="hidden md:flex md:w-[60%] h-full">
                <RightHero />
            </div>

        </div>
    );
};

export default Signup;
