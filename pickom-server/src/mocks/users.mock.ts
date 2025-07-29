import { User } from "src/user/types/user.type";

export const MOCK_USERS: User[] = [
  {
    uid: '1',
    name: 'Alice',
    email: 'alice@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    prevLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'sender',
  },
  {
    uid: '2',
    name: 'Bob',
    email: 'bob@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    prevLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'picker',
  },
  {
    uid: '3',
    name: 'Charlie',
    email: 'charlie@example.com',
    avatarUrl: 'https://example.com/avatar.jpg',
    prevLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'picker',
  },
];