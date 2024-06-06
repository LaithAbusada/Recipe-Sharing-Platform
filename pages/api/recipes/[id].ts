// pages/api/recipes/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/pages/firebase/config";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { Recipe, Comment } from "@/components/types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const docRef = doc(firestore, "recipes", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return res.status(200).json(docSnap.data());
      } else {
        return res.status(404).json({ message: "Recipe not found" });
      }
    }

    if (req.method === "PUT") {
      const updatedRecipe: Recipe = req.body;
      const docRef = doc(firestore, "recipes", id as string);

      // Ensure timestamp is a Firestore Timestamp
      const updateData: Partial<Recipe> = {
        title: updatedRecipe.title,
        ingredients: updatedRecipe.ingredients,
        steps: updatedRecipe.steps,
        cookingTime: updatedRecipe.cookingTime,
        imageUrls: updatedRecipe.imageUrls,
        userName: updatedRecipe.userName,
        timestamp:
          updatedRecipe.timestamp instanceof Timestamp
            ? updatedRecipe.timestamp
            : Timestamp.now(),
        comments: updatedRecipe.comments.map((comment) => ({
          ...comment,
          timestamp:
            comment.timestamp instanceof Timestamp
              ? comment.timestamp
              : Timestamp.now(),
        })),
      };

      await updateDoc(docRef, updateData);
      return res.status(200).json({ message: "Recipe updated successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error updating recipe:", error); // Log the error for debugging
    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    } else {
      return res
        .status(500)
        .json({ message: "Internal server error", error: String(error) });
    }
  }
};

export default handler;
