// pages/api/recipes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/pages/firebase/config';
import { collection, addDoc, query, orderBy, getDocs, updateDoc, doc, where } from 'firebase/firestore';
import { Recipe, Comment } from '@/components/types';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const postsCollection = collection(firestore, "recipes");
      const postsQuery = query(postsCollection, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(postsQuery);
      const recipes: Recipe[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Recipe[];
      return res.status(200).json(recipes);
    }

    if (req.method === 'POST') {
      const newRecipe: Recipe = req.body;
      const postsCollection = collection(firestore, "recipes");
      await addDoc(postsCollection, newRecipe);
      return res.status(201).json({ message: 'Recipe added successfully' });
    }

    if (req.method === 'PUT') {
      const { postId, comment }: { postId: string; comment: Comment } = req.body;
      const postsCollection = collection(firestore, "recipes");
      const postsQuery = query(postsCollection, where("id", "==", postId));
      const querySnapshot = await getDocs(postsQuery);

      if (!querySnapshot.empty) {
        const postDoc = querySnapshot.docs[0];
        const postRef = doc(firestore, `recipes/${postDoc.id}`);
        const post = postDoc.data() as Recipe;
        const updatedComments = [...post.comments, comment];
        await updateDoc(postRef, { comments: updatedComments });
        return res.status(200).json({ message: 'Comment added successfully' });
      } else {
        return res.status(404).json({ message: 'Post not found' });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    } else {
      return res.status(500).json({ message: 'Internal server error', error: String(error) });
    }
  }
};

export default handler;
