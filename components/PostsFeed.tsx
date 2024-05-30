// components/PostsFeed.tsx
import React, { useState } from "react";
import PostDetails from "./PostDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { Post, Comment } from "./types";
import { formatTimestamp } from "@/utils/formatTimeStamp";

interface PostsFeedProps {
  posts: Post[];
  onCommentSubmit: (postId: string, comment: Comment) => void;
}

const PostsFeed: React.FC<PostsFeedProps> = ({ posts, onCommentSubmit }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseDetails = () => {
    setSelectedPost(null);
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
          <div
            key={post.id}
            className="bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
            <div className="flex items-center mb-2">
              <div className="mr-2 text-gray-700 font-bold">
                {post.userName}
              </div>
              <div className="text-gray-500 text-sm">
                {formatTimestamp(post.timestamp)}
              </div>
            </div>
            <p className="text-gray-800 mb-2">{post.content}</p>
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
                className="text-gray-600 mr-1"
              />
              <span className="text-gray-600">{post.comments.length}</span>
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
