import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import uuid library
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/pages/firebase/config"; // Import storage from Firebase config
import { Post } from "./types";

interface CreatePostProps {
  onPostSubmit: (post: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostSubmit }) => {
  const [postContent, setPostContent] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const userName = "John Doe"; // Replace with the actual user's name
  const timestamp = Timestamp.now();

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImages((prevImages) => [...prevImages, ...fileArray]); // Append new files to existing state
      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]); // Append new previews to existing state
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (postContent.trim() || images.length > 0) {
      const newPost: Post = {
        id: uuidv4(), // Generate a unique ID
        content: postContent,
        imageUrls: [], // Initialize as an empty array, to be filled after upload
        userName,
        timestamp,
        comments: [], // Initialize comments as an empty array
      };

      const uploadPromises = images.map(async (image) => {
        const imageRef = ref(storage, `images/${newPost.id}/${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        return getDownloadURL(snapshot.ref);
      });

      newPost.imageUrls = await Promise.all(uploadPromises);

      await onPostSubmit(newPost);
      setPostContent("");
      setImages([]);
      setImagePreviews([]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-fefeff p-6 rounded-lg shadow-md">
      {" "}
      {/* Light White */}
      <h1 className="text-2xl font-bold mb-4 text-fe654f">
        {" "}
        {/* Red-Orange */}
        Share Your Recipe
      </h1>
      <form onSubmit={handlePostSubmit}>
        <textarea
          value={postContent}
          onChange={handlePostChange}
          placeholder="Write your recipe here..."
          className="w-full p-3 mb-4 border border-fed99b rounded-md focus:outline-none focus:ring-2 focus:ring-fe654f"
          rows={4}
        />
        <div className="flex items-center mb-4">
          <label
            htmlFor="image-upload"
            className="flex items-center cursor-pointer text-fe654f hover:text-fed99b transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faImage} className="mr-2" />
            <span>Add Images</span>
          </label>
          <input
            type="file"
            id="image-upload"
            onChange={handleImageChange}
            className="hidden"
            multiple
          />
        </div>
        <div className="flex flex-wrap mb-4">
          {imagePreviews.map((image, index) => (
            <div key={index} className="relative w-16 h-16 mr-4 mb-4">
              <img
                src={image}
                alt={`Selected ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-0 right-0 text-red-600 bg-white rounded-full p-1"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="bg-fe654f text-white py-2 px-4 rounded-md hover:bg-fed99b focus:outline-none focus:ring-2 focus:ring-fe654f focus:ring-opacity-50"
          disabled={loading}
        >
          {loading ? "Posting..." : "Post Recipe"}
        </button>
      </form>
      {loading && (
        <p className="mt-4 text-fe654f">Posting your recipe, please wait...</p>
      )}
    </div>
  );
};

export default CreatePost;
