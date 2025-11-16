
const OrangeButton = ({ label, onClick }) => {
    return (
        <button
            type="button"
            className="text-white bg-[#e95e19] hover:bg-[#F6A137] font-medium font-roboto rounded-lg 
            text-sm px-3.5 py-1.5 shadow-md transition duration-200 ease-in-out"
            onClick={onClick}
        >
            {label}
        </button>
    )
}

export default OrangeButton
