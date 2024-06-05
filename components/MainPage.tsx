import React, { useState, useEffect } from "react";
import CreateRecipe from "./CreateRecipe";
import PostsFeed from "./PostsFeed";
import Navbar from "./Navbar";
import { Recipe, Comment } from "./types";
import axios from "axios";
import { Timestamp } from "firebase/firestore";

const MainPage: React.FC = () => {
  const [posts, setPosts] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/recipes");
      const recipes: Recipe[] = response.data.map((data: any) => {
        const timestamp = new Timestamp(
          data.timestamp.seconds,
          data.timestamp.nanoseconds
        );
        return { ...data, timestamp } as Recipe;
      });
      setPosts(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRecipeSubmit = async (recipe: Recipe) => {
    await fetchPosts();
  };

  const handleCommentSubmit = async (postId: string, comment: Comment) => {
    try {
      await axios.put("/api/recipes", { postId, comment });
      console.log("Comment added");
      fetchPosts(); // Optionally re-fetch posts to update the state
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-d6efff">
      <Navbar />
      <div className="container mx-auto p-4">
        <CreateRecipe onRecipeSubmit={handleRecipeSubmit} />
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="spinner mt-10"></div>
            <p className="text-fe654f ml-2 mt-10">
              Loading posts, please wait...
            </p>
          </div>
        ) : (
          <PostsFeed posts={posts} onCommentSubmit={handleCommentSubmit} />
        )}
      </div>
    </div>
  );
};

export default MainPage;
