// utils/formatTimestamp.ts
import { Timestamp } from "firebase/firestore";

export const formatTimestamp = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return date.toLocaleString();
};
