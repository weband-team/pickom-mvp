export enum UserType {
  SENDER = 'sender',
  PICKER = 'picker'
}

export enum DeliveryMethod {
  WITHIN_CITY = 'within_city',
  INTER_CITY = 'inter_city',
  INTERNATIONAL = 'international',
  COMBINED = 'combined'
}

export interface BaseUserData {
  fullName: string;
  email: string;
  age: number;
  country: string;
  city: string;
  phoneNumber?: string;
  isVerified: boolean;
  avatarUrl?: string;
  description?: string;
  userType: UserType //TODO: add combined account
  id: string;
  rating: number;
}

export interface PickerSpecificData {
  deliveryMethods: DeliveryMethod[];
  bio?: string;
  vehicleType?: 'car' | 'bike' | 'walking' | 'public_transport';
}

export interface RegisterRequest {
  userType: UserType;
  userData: BaseUserData;
  pickerData?: PickerSpecificData;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  user: {
    id: string;
    userType: UserType;
    email: string;
    fullName: string;
    isVerified: boolean;
  };
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    userType: UserType;
    email: string;
    fullName: string;
    isVerified: boolean;
  };
  token: string;
  refreshToken: string;
}