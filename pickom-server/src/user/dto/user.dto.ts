export class UserDto {
  uid: string;
  email: string;
  name: string;
  prevLoginAt?: Date;
  avatarUrl?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  role: 'sender' | 'picker';
}
