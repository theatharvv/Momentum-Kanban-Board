
const CustomButton = ({ label, onClick }) => {
    return (
        <div className="ps-1 pe-8 pt-6 w-full">
            <button
                type="button"
                onClick={onClick}
                className="
                    w-full px-5 py-2 mb-2 font-ibmPlexSans text-xl font-medium text-white 
                    bg-black rounded-lg
                    transition-transform duration-300 ease-in-out
                    hover:bg-zinc-900 hover:scale-105 hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                "
            >
                {label}
            </button>
        </div>
    );
};

export default CustomButton;
