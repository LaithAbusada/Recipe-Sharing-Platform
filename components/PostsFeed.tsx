// src/components/PostsFeed.tsx
import React, { useState } from "react";
import PostDetails from "./PostDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { Recipe, Comment } from "./types";
import { formatTimestamp } from "@/utils/formatTimeStamp";
import { useRouter } from "next/router";
import Rating from "./Rating";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/pages/firebase/config";

interface PostsFeedProps {
  posts: Recipe[];
  onCommentSubmit: (postId: string, comment: Comment) => void;
}

const PostsFeed: React.FC<PostsFeedProps> = ({
  posts: initialPosts,
  onCommentSubmit,
}) => {
  const [posts, setPosts] = useState<Recipe[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<Recipe | null>(null);
  const router = useRouter();
  const [user] = useAuthState(auth);

  const handleCommentIconClick = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleCloseDetails = () => {
    setSelectedPost(null);
  };

  const handleRatingSubmit = (postId: string, newAverageRating: number) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, averageRating: newAverageRating } : post
    );
    setPosts(updatedPosts);
  };

  return (
    <div className="mt-6">
      {posts.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg">
            There are no posts currently <span className="text-2xl">😢</span>
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex items-center mb-2">
              <div className="mr-2 text-gray-700 font-bold">
                {post.userName}
              </div>
              <div className="text-gray-500 text-sm">
                {formatTimestamp(post.timestamp)}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-2">
              Cooking Time: {post.cookingTime}
            </p>
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
            {post.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {post.imageUrls.map((imageUrl, idx) => (
                  <img
                    key={idx}
                    src={imageUrl}
                    alt={`Post Image ${idx}`}
                    className="object-cover w-full rounded-lg h-auto"
                  />
                ))}
              </div>
            )}
            <div className="flex items-center mt-2">
              <FontAwesomeIcon
                icon={faCommentDots}
                className="text-gray-600 mr-1 cursor-pointer"
                onClick={() => handleCommentIconClick(post.id)}
              />
              <span className="text-gray-600">{post.comments.length}</span>
            </div>
            <div className="mt-2">
              <Rating
                postId={post.id}
                currentRating={post.averageRating}
                userRating={
                  user
                    ? (() => {
                        const uid = user?.uid;
                        console.log("User ID:", uid);
                        const rating =
                          post.ratings.find((r) => {
                            console.log("Rating User ID:", r.userId);
                            return r.userId === uid;
                          })?.rating || null;
                        console.log("User Rating:", rating);
                        return rating;
                      })()
                    : null
                }
                onRatingSubmit={(newAverageRating) =>
                  handleRatingSubmit(post.id, newAverageRating)
                }
              />
              <div className="text-gray-600 mt-2">
                Average Rating: {post.averageRating.toFixed(1)}
              </div>
            </div>
          </div>
        ))
      )}
      {selectedPost && (
        <PostDetails
          post={selectedPost}
          onClose={handleCloseDetails}
          onCommentSubmit={onCommentSubmit}
        />
      )}
    </div>
  );
};

export default PostsFeed;
