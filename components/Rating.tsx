import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/pages/firebase/config";
import axios from "axios";

interface RatingProps {
  postId: string;
  currentRating: number;
  userRating: number | null;
  onRatingSubmit: (newAverageRating: number) => void;
}

const Rating: React.FC<RatingProps> = ({
  postId,
  currentRating,
  userRating,
  onRatingSubmit,
}) => {
  const [rating, setRating] = useState<number | null>(userRating);
  const [user] = useAuthState(auth);

  useEffect(() => {
    setRating(userRating);
  }, [userRating]);

  const handleRating = async (newRating: number) => {
    if (user) {
      setRating(newRating);
      try {
        const response = await axios.put("/api/recipes", {
          postId,
          rating: { userId: user.uid, rating: newRating },
        });
        const newAverageRating = response.data.averageRating;
        onRatingSubmit(newAverageRating);
      } catch (error) {
        console.error("Error submitting rating:", error);
      }
    }
  };

  return (
    <div className="flex items-center">
      <span className="mr-2">Rate this recipe:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesomeIcon
          key={star}
          icon={faStar}
          className={`cursor-pointer ${
            rating === null || star > (rating || currentRating)
              ? "text-gray-300"
              : "text-yellow-500"
          }`}
          onClick={() => handleRating(star)}
        />
      ))}
    </div>
  );
};

export default Rating;
