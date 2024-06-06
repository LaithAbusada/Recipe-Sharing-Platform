// pages/myrecipes/index.tsx
import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/pages/firebase/config";
import { Recipe } from "@/components/types";
import axios from "axios";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";

const UserRecipes: React.FC = () => {
  const [user] = useAuthState(auth);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (user) {
        try {
          const response = await axios.get("/api/recipes", {
            params: { uid: user.uid },
          });
          setRecipes(response.data);
        } catch (error) {
          console.error("Error fetching user recipes:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserRecipes();
  }, [user]);

  const handleEditClick = (recipeId: string) => {
    router.push(`/myrecipes/${recipeId}`);
  };

  return (
    <div className="min-h-screen bg-d6efff">
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-fe654f">My Recipes</h1>
        {loading ? (
          <p className="text-fe654f">Loading...</p>
        ) : recipes.length === 0 ? (
          <p className="text-fe654f text-center mt-10">
            You don't have any recipes yet. Start creating your culinary
            masterpiece! 😃
          </p>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white p-4 rounded-lg shadow-md mb-4"
            >
              <h3 className="text-xl font-bold mb-2 text-fe654f">
                {recipe.title}
              </h3>
              <button
                onClick={() => handleEditClick(recipe.id)}
                className="bg-fe654f text-white py-2 px-4 rounded-md hover:bg-fed99b focus:outline-none focus:ring-2 focus:ring-fe654f focus:ring-opacity-50"
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserRecipes;
