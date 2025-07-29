export interface User {
  uid: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'picker' | 'sender';
  prevLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
}

export interface UserMeResponce {
  user: User;
  message: string;
}