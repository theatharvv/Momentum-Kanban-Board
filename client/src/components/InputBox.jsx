const InputBox = ({ label, placeholder, type = "text", onChange }) => {
  return (
    <div className="pt-4 pb-1 ps-1 pe-8 w-full">
      <p className="pb-1 font-ibmPlexSans text-xl font-medium text-black">{label}</p>
      <input
        className="px-3 w-full h-[75%] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        type={type}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
};

export default InputBox;
