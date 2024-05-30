// src/pages/types.ts
import { Timestamp } from "firebase/firestore";

export interface Comment {
  id: string;
  userName: string;
  content: string;
  timestamp: Timestamp;
}

export interface Post {
  id: string;
  content: string;
  imageUrls: string[];
  userName: string;
  timestamp: Timestamp;
  comments: Comment[];
}

export type NewPost = Omit<Post, "id">;
