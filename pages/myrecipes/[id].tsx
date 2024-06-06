// pages/myrecipes/[id].tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, storage } from "@/pages/firebase/config";
import { Recipe } from "@/components/types";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "@/components/Navbar";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimes } from "@fortawesome/free-solid-svg-icons";

const EditRecipe: React.FC = () => {
  const [user] = useAuthState(auth);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState<string>("");
  const [ingredients, setIngredients] = useState<string>("");
  const [steps, setSteps] = useState<string>("");
  const [cookingTime, setCookingTime] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { id: recipeId } = router.query;

  useEffect(() => {
    const fetchRecipe = async () => {
      if (recipeId) {
        console.log("Fetching recipe with id:", recipeId);
        try {
          const response = await axios.get(`/api/recipes/${recipeId}`);
          const recipeData = response.data;
          setRecipe(recipeData);
          setTitle(recipeData.title);
          setIngredients(recipeData.ingredients.join("\n"));
          setSteps(recipeData.steps.join("\n"));
          setCookingTime(recipeData.cookingTime);
          setExistingImages(recipeData.imageUrls);
        } catch (error) {
          console.error("Error fetching recipe:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRecipe();
  }, [recipeId]);

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

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (recipe && recipeId) {
      console.log("Updating recipe with id:", recipeId);
      const updatedRecipe: Recipe = {
        ...recipe,
        title,
        ingredients: ingredients.split("\n"),
        steps: steps.split("\n"),
        cookingTime,
        imageUrls: existingImages, // Start with existing images
      };

      const uploadPromises = images.map(async (image) => {
        const imageRef = ref(storage, `images/${uuidv4()}-${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      updatedRecipe.imageUrls = [...existingImages, ...newImageUrls]; // Combine existing and new images

      try {
        await axios.put(`/api/recipes/${recipeId}`, updatedRecipe);
        toast.success("Recipe updated successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        router.push("/myrecipes");
      } catch (error) {
        console.error("Error updating recipe:", error);
      }
    } else {
      console.error("Recipe or recipeId is missing.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-d6efff">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="bg-fefeff p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-fe654f">
            Edit Your Recipe
          </h1>
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
            {existingImages.map((image, index) => (
              <div key={index} className="relative w-16 h-16 mr-4 mb-4">
                <img
                  src={image}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(index)}
                  className="absolute top-0 right-0 text-red-600 bg-white rounded-full p-1"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="bg-fe654f text-white py-2 px-4 rounded-md hover:bg-fed99b focus:outline-none focus:ring-2 focus:ring-fe654f focus:ring-opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRecipe;
