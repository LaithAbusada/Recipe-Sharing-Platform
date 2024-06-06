// src/pages/types.ts
import { Timestamp } from "firebase/firestore";

export interface Comment {
  id: string;
  userName: string;
  content: string;
  timestamp: Timestamp;
}

export interface Rating {
  userId: string;
  rating: number;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  cookingTime: string;
  imageUrls: string[];
  userName: string;
  timestamp: Timestamp;
  comments: Comment[];
  ratings: Rating[];
  averageRating: number;
}

export type NewRecipe = Omit<Recipe, "id">;
