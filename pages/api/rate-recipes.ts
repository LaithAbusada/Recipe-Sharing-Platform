// pages/api/rate-recipe.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/pages/firebase/config";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { recipeId, rating } = req.body;

      if (!recipeId || rating == null) {
        return res
          .status(400)
          .json({ message: "Recipe ID and rating are required" });
      }

      const recipeRef = doc(firestore, "recipes", recipeId);
      const recipeDoc = await getDoc(recipeRef);

      if (!recipeDoc.exists()) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      await updateDoc(recipeRef, {
        ratings: arrayUnion(rating),
      });

      return res.status(200).json({ message: "Rating submitted successfully" });
    } catch (error) {
      console.error("Internal server error:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
