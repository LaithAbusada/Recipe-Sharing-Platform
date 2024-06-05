import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Import uuid library
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, firestore, auth } from "@/pages/firebase/config"; // Import storage and auth from Firebase config
import { Recipe } from "./types";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";

interface CreateRecipeProps {
  onRecipeSubmit: (recipe: Recipe) => void;
}

const CreateRecipe: React.FC<CreateRecipeProps> = ({ onRecipeSubmit }) => {
  const [title, setTitle] = useState<string>("");
  const [ingredients, setIngredients] = useState<string>("");
  const [steps, setSteps] = useState<string>("");
  const [cookingTime, setCookingTime] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const timestamp = Timestamp.now();

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const fullName = `${userData.firstName} ${userData.lastName}`;
            setUserName(fullName || user.email || "");
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error fetching user data:", error.message);
          } else {
            console.error("Error fetching user data:", String(error));
          }
        }
      }
    };

    fetchUserName();
  }, [user]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleIngredientsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setIngredients(e.target.value);
  };

  const handleStepsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSteps(e.target.value);
  };

  const handleCookingTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCookingTime(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImages((prevImages) => [...prevImages, ...fileArray]);
      const previews = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        title.trim() ||
        ingredients.trim() ||
        steps.trim() ||
        images.length > 0
      ) {
        const newRecipe: Recipe = {
          id: uuidv4(), // Generate a unique ID
          title,
          ingredients: ingredients.split("\n"),
          steps: steps.split("\n"),
          cookingTime,
          imageUrls: [], // Initialize as an empty array, to be filled after upload
          userName,
          timestamp,
          comments: [], // Initialize comments as an empty array
        };

        const uploadPromises = images.map(async (image) => {
          const imageRef = ref(storage, `images/${newRecipe.id}/${image.name}`);
          const snapshot = await uploadBytes(imageRef, image);
          return getDownloadURL(snapshot.ref);
        });

        newRecipe.imageUrls = await Promise.all(uploadPromises);

        await onRecipeSubmit(newRecipe);
        setTitle("");
        setIngredients("");
        setSteps("");
        setCookingTime("");
        setImages([]);
        setImagePreviews([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error submitting recipe:", error.message);
      } else {
        console.error("Error submitting recipe:", String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-fefeff p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-fe654f">Share Your Recipe</h1>
      <form onSubmit={handleRecipeSubmit}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Recipe Title"
          className="w-full p-3 mb-4 border border-fed99b rounded-md focus:outline-none focus:ring-2 focus:ring-fe654f"
        />
        <textarea
          value={ingredients}
          onChange={handleIngredientsChange}
          placeholder="Ingredients (one per line)"
          className="w-full p-3 mb-4 border border-fed99b rounded-md focus:outline-none focus:ring-2 focus:ring-fe654f"
          rows={4}
        />
        <textarea
          value={steps}
          onChange={handleStepsChange}
          placeholder="Preparation Steps (one per line)"
          className="w-full p-3 mb-4 border border-fed99b rounded-md focus:outline-none focus:ring-2 focus:ring-fe654f"
          rows={4}
        />
        <input
          type="text"
          value={cookingTime}
          onChange={handleCookingTimeChange}
          placeholder="Cooking Time"
          className="w-full p-3 mb-4 border border-fed99b rounded-md focus:outline-none focus:ring-2 focus:ring-fe654f"
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

export default CreateRecipe;