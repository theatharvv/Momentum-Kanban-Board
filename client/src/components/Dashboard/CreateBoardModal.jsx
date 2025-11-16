import { useState } from "react";
import axios from "axios";

const CreateBoardModal = ({ isOpen, onClose, onBoardCreated }) => {
  const [title, setTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/upload", // image upload endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.imageUrl; // Assuming backend returns { imageUrl: "..." }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a board title");
      return;
    }

    setIsLoading(true);
    try {
      let backgroundImageUrl = "default"; // Default value as per API
      
      // Upload image if selected
      if (selectedImage) {
        backgroundImageUrl = await uploadImage(selectedImage);
      }

      // Create board using your existing API
      const response = await axios.post(
        "http://localhost:5000/api/v1/boards", // Your existing endpoint
        {
          title: title.trim(),
          background: backgroundImageUrl, // Will be either "default" or the uploaded image URL
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Your API returns { board, lists }
      const { board, lists } = response.data;
      
      // Notify parent component with the new board
      onBoardCreated(board);
      
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating board:", error);
      alert("Failed to create board. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview); // Clean up memory
      setImagePreview(null);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Create New Board</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Board Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter board title..."
              disabled={isLoading}
              maxLength={50}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              disabled={isLoading}
            />
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Background preview"
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>
            )}

            {/* Default background info */}
            {!selectedImage && (
              <p className="text-xs text-gray-500 mt-2">
                If no image is selected, a default background will be used.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Board"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
