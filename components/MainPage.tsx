import React, { useState, useEffect } from "react";
import CreateRecipe from "./CreateRecipe";
import PostsFeed from "./PostsFeed";
import Navbar from "./Navbar";
import { Recipe, Comment } from "./types";
import { firestore } from "@/pages/firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { formatTimestamp } from "@/utils/formatTimeStamp";
import { Timestamp } from "firebase/firestore";

const MainPage: React.FC = () => {
  const [posts, setPosts] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsCollection = collection(firestore, "recipes");
      const postsQuery = query(postsCollection, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(postsQuery);
      const recipes: Recipe[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp =
          data.timestamp instanceof Timestamp
            ? data.timestamp
            : Timestamp.fromDate(new Date(data.timestamp));
        return { ...data, timestamp, id: doc.id } as Recipe;
      });
      setPosts(recipes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching recipes:", error.message);
      } else {
        console.error("Error fetching recipes:", String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRecipeSubmit = async (recipe: Recipe) => {
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      if (response.ok) {
        console.log("New recipe added");
        fetchPosts(); // Optionally re-fetch posts to update the state
      } else {
        const errorText = await response.text();
        console.error("Error adding recipe:", errorText);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error adding recipe:", error.message);
      } else {
        console.error("Error adding recipe:", String(error));
      }
    }
  };

  const handleCommentSubmit = async (postId: string, comment: Comment) => {
    try {
      const postRef = doc(firestore, "recipes", postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment),
      });
      console.log("Comment added");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error adding comment:", error.message);
      } else {
        console.error("Error adding comment:", String(error));
      }
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
