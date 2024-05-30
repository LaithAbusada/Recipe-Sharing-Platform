import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Timestamp } from "firebase/firestore";
import { Post, Comment } from "./types";
import { formatTimestamp } from "@/utils/formatTimeStamp";

interface PostDetailsProps {
  post: Post;
  onClose: () => void;
  onCommentSubmit: (postId: string, comment: Comment) => void;
}

const PostDetails: React.FC<PostDetailsProps> = ({
  post,
  onClose,
  onCommentSubmit,
}) => {
  const [commentContent, setCommentContent] = useState<string>("");
  const [localComments, setLocalComments] = useState<Comment[]>(post.comments);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentContent(e.target.value);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        userName: "Jane Doe", // Replace with the actual user's name
        content: commentContent,
        timestamp: Timestamp.now(),
      };
      try {
        await onCommentSubmit(post.id, newComment);
        setLocalComments([...localComments, newComment]);
        setCommentContent("");
        console.log("New comment added:", newComment);
      } catch (error) {
        console.error("Error adding comment: ", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-red-600 bg-white rounded-full p-1"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="mr-2 text-gray-700 font-bold">{post.userName}</div>
            <div className="text-gray-500 text-sm">
              {formatTimestamp(post.timestamp)}
            </div>
          </div>
          <p className="text-gray-800 mb-2">{post.content}</p>
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
        </div>
        <div>
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

export default PostDetails;