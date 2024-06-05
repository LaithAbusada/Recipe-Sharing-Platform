// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/pages/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const { uid } = req.query;
      if (!uid) return res.status(400).json({ message: 'User ID is required' });

      const userDoc = await getDoc(doc(firestore, "users", uid as string));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fullName = `${userData.firstName} ${userData.lastName}`;
        return res.status(200).json({ fullName, email: userData.email });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      } else {
        return res.status(500).json({ message: 'Internal server error', error: String(error) });
      }
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler;
