import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/pages/firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Recipe } from "@/components/types";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "GET") {
      const { uid } = req.query;
      if (!uid) {
        return res.status(400).json({ message: "User ID is required" });
      }
      console.log("now searching");
      const postsCollection = collection(firestore, "recipes");
      const postsQuery = query(
        postsCollection,
        where("userId", "==", uid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(postsQuery);
      const recipes: Recipe[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[];
      return res.status(200).json(recipes);
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
