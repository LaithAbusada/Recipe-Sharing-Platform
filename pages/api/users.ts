import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/pages/firebase/config";
import { doc, getDoc } from "firebase/firestore";

const getDocumentWithRetry = async (docRef: any, retries = 3): Promise<any> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error: any) {
      if (attempt === retries - 1 || error.code !== "unavailable") {
        throw error;
      }
      console.log(`Attempt ${attempt + 1} failed: ${error.message}`);
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
    }
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const { uid } = req.query;
      console.log(uid);
      if (!uid) return res.status(400).json({ message: "User ID is required" });

      const userDocRef = doc(firestore, "users", uid as string);
      const userData = await getDocumentWithRetry(userDocRef);

      if (userData) {
        const fullName = `${(userData as any).firstName} ${
          (userData as any).lastName
        }`;
        return res
          .status(200)
          .json({ fullName, email: (userData as any).email });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error as any).response?.data) {
        console.error("Internal server error:", (error as any).response.data);
        return res.status(500).json({
          message: "Internal server error",
          error: (error as any).response.data,
        });
      } else {
        console.error("Internal server error:", error);
        return res.status(500).json({
          message: "Internal server error",
          error: (error as Error).message,
        });
      }
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
