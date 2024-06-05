import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/pages/firebase/config";
import { Recipe, Comment } from "@/components/types";
import { formatTimestamp } from "@/utils/formatTimeStamp";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/pages/firebase/config";

const PostPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Recipe | null>(null);
  const [commentContent, setCommentContent] = useState<string>("");
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [user, loadingAuth, errorAuth] = useAuthState(auth);

  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        const postDoc = await getDoc(doc(firestore, "recipes", id as string));
        if (postDoc.exists()) {
          const postData = postDoc.data() as Recipe;
          setPost(postData);
          setLocalComments(postData.comments);
        } else {
          console.error("Post does not exist");
        }
      }
    };

    const fetchUserName = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const fullName = `${userData.firstName} ${userData.lastName}`;
            setUserName(fullName || user.email || "");
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error fetching user data:", error.message);
          } else {
            console.error("Error fetching user data:", String(error));
          }
        }
      }
    };

    fetchPost();
    fetchUserName();
  }, [id, user]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentContent(e.target.value);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim() && post) {
      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        userName: userName,
        content: commentContent,
        timestamp: Timestamp.now(),
      };
      try {
        const postRef = doc(firestore, "recipes", id as string); // Use the actual Firestore document ID from the URL
        await updateDoc(postRef, {
          comments: arrayUnion(newComment),
        });
        setLocalComments([...localComments, newComment]);
        setCommentContent("");
        console.log("New comment added:", newComment);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error adding comment:", error.message);
        } else {
          console.error("Error adding comment:", String(error));
        }
      }
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-2">Cooking Time: {post.cookingTime}</p>
        <h4 className="font-bold">Ingredients:</h4>
        <ul className="list-disc ml-5 mb-2">
          {post.ingredients.map((ingredient, idx) => (
            <li key={idx} className="text-gray-800">
              {ingredient}
            </li>
          ))}
        </ul>
        <h4 className="font-bold">Preparation Steps:</h4>
        <ol className="list-decimal ml-5 mb-2">
          {post.steps.map((step, idx) => (
            <li key={idx} className="text-gray-800">
              {step}
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-2 gap-4">
          {post.imageUrls.map((imageUrl, idx) => (
            <img
              key={idx}
              src={imageUrl}
              alt={`Post Image ${idx}`}
              className="object-cover w-full h-40 rounded-lg"
            />
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Comments</h3>
          {localComments.length === 0 ? (
            <p className="text-gray-600">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            localComments.map((comment, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex items-center mb-1">
                  <div className="mr-2 text-gray-700 font-bold">
                    {comment.userName}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {formatTimestamp(comment.timestamp)}
                  </div>
                </div>
                <p className="text-gray-800">{comment.content}</p>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleCommentSubmit} className="mt-4">
          <textarea
            value={commentContent}
            onChange={handleCommentChange}
            placeholder="Write your comment..."
            className="w-full p-3 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fe654f"
            rows={2}
          />
          <button
            type="submit"
            className="bg-fe654f text-white py-2 px-4 rounded-md hover:bg-fed99b focus:outline-none focus:ring-2 focus:ring-fe654f focus:ring-opacity-50"
          >
            Submit Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostPage;
