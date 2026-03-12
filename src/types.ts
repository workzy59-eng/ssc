export type UserRole = 'client' | 'pro';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  category?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: any; // Firestore Timestamp
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: any;
  updatedAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export const SERVICE_CATEGORIES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Cleaner',
  'Gardener',
  'Handyman',
  'HVAC Technician',
  'Locksmith',
  'Pest Control'
];
