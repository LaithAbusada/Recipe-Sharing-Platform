// pages/api/recipes.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/pages/firebase/config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { Recipe, Comment, Rating } from "@/components/types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      const postsCollection = collection(firestore, "recipes");
      const postsQuery = query(postsCollection, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(postsQuery);
      const recipes: Recipe[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
      return res.status(200).json(recipes);
    }

    if (req.method === "POST") {
      const newRecipe: Omit<Recipe, "id"> = req.body;
      const postsCollection = collection(firestore, "recipes");

      const recipeWithTimestamp = {
        ...newRecipe,
        timestamp: Timestamp.now(),
        ratings: [],
        averageRating: 0,
      };

      const docRef = await addDoc(postsCollection, recipeWithTimestamp);
      const addedRecipe = { id: docRef.id, ...recipeWithTimestamp };
      return res
        .status(201)
        .json({ message: "Recipe added successfully", recipe: addedRecipe });
    }

    if (req.method === "PUT") {
      const { postId, rating }: { postId: string; rating: Rating } = req.body;
      const postRef = doc(firestore, "recipes", postId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const post = postDoc.data() as Recipe;
        const existingRatingIndex = post.ratings.findIndex(
          (r) => r.userId === rating.userId
        );

        if (existingRatingIndex >= 0) {
          post.ratings[existingRatingIndex].rating = rating.rating;
        } else {
          post.ratings.push(rating);
        }

        const totalRating = post.ratings.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = totalRating / post.ratings.length;

        await updateDoc(postRef, { ratings: post.ratings, averageRating });
        return res.status(200).json({ averageRating });
      } else {
        return res.status(404).json({ message: "Post not found" });
      }
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Internal server error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: String(error) });
  }
};

export default handler;
