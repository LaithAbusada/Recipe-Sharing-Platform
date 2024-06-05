import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "@/pages/firebase/config";
import { Recipe } from "./types";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";

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
          const response = await axios.get(`/api/users`, {
            params: { uid: user.uid },
          });
          const userData = response.data;
          const fullName = `${userData.fullName}`;
          setUserName(fullName || user.email || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
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
        const newRecipe: Omit<Recipe, "id"> = {
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
          const imageRef = ref(
            storage,
            `images/laith/${uuidv4()}-${image.name}`
          );
          const snapshot = await uploadBytes(imageRef, image);
          const downloadURL = await getDownloadURL(snapshot.ref);
          return downloadURL;
        });

        newRecipe.imageUrls = await Promise.all(uploadPromises);

        const response = await axios.post("/api/recipes", newRecipe);
        const addedRecipe = response.data.recipe;

        await onRecipeSubmit(addedRecipe);
        setTitle("");
        setIngredients("");
        setSteps("");
        setCookingTime("");
        setImages([]);
        setImagePreviews([]);
      }
    } catch (error) {
      console.error("Error submitting recipe:", error);
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
