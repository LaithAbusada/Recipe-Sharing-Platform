import React, { useState, useEffect } from "react";
import CreatePost from "./CreatePost";
import PostsFeed from "./PostsFeed";
import Navbar from "./Navbar";
import { firestore } from "@/pages/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  getDocs,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Post, Comment } from "./types";
import { formatTimestamp } from "@/utils/formatTimeStamp";

const MainPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const postsCollection = collection(firestore, "posts");
    const postsQuery = query(postsCollection, orderBy("timestamp", "desc")); // Order by timestamp descending

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsList);
      setLoading(false); // Set loading to false after posts are fetched
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (post: Post) => {
    try {
      const postsCollection = collection(firestore, "posts");
      await addDoc(postsCollection, post);
      console.log("New post added with ID: ", post.id);
      // The onSnapshot listener will handle the state update
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleCommentSubmit = async (postId: string, comment: Comment) => {
    try {
      console.log("postId:", postId);
      const postsCollection = collection(firestore, "posts");
      const postsQuery = query(postsCollection, where("id", "==", postId));
      const querySnapshot = await getDocs(postsQuery);

      if (!querySnapshot.empty) {
        const postDoc = querySnapshot.docs[0];
        const post = postDoc.data() as Post;
        const updatedComments = [...post.comments, comment];
        const postRef = doc(firestore, `posts/${postDoc.id}`);
        await updateDoc(postRef, { comments: updatedComments });
        console.log("Comment added:", comment);
        // The state will be updated by the onSnapshot listener
      } else {
        console.error("Post does not exist:", postId);
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-d6efff">
      <Navbar />
      <div className="container mx-auto p-4">
        <CreatePost onPostSubmit={handlePostSubmit} />
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
