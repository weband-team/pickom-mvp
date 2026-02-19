export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Password must contain both letters and numbers' };
  }

  return { isValid: true };
};

export const validateAge = (age: number): ValidationResult => {
  if (!age || isNaN(age)) {
    return { isValid: false, error: 'Age is required' };
  }

  if (age < 18) {
    return { isValid: false, error: 'You must be at least 18 years old' };
  }

  if (age > 80) {
    return { isValid: false, error: 'Age must be 80 or less' };
  }

  return { isValid: true };
};

export const validateFullName = (fullName: string): ValidationResult => {
  if (!fullName) {
    return { isValid: false, error: 'Full name is required' };
  }

  const trimmedName = fullName.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters long' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Full name must be 50 characters or less' };
  }

  return { isValid: true };
};

export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  if (!phoneNumber) {
    // Phone number is optional
    return { isValid: true };
  }

  // International phone format: +[1-3 digits country code][4-14 digits]
  // Examples: +1234567890, +380501234567, +49123456789
  const phoneRegex = /^\+[1-9]\d{1,3}\d{4,14}$/;

  if (!phoneRegex.test(phoneNumber)) {
    return {
      isValid: false,
      error: 'Please enter a valid international phone number (e.g., +1234567890)'
    };
  }

  return { isValid: true };
};

export const validateCountry = (country: string): ValidationResult => {
  if (!country) {
    return { isValid: false, error: 'Country is required' };
  }

  const trimmedCountry = country.trim();

  if (trimmedCountry.length < 2) {
    return { isValid: false, error: 'Please enter a valid country name' };
  }

  return { isValid: true };
};

export const validateCity = (city: string): ValidationResult => {
  if (!city) {
    return { isValid: false, error: 'City is required' };
  }

  const trimmedCity = city.trim();

  if (trimmedCity.length < 2) {
    return { isValid: false, error: 'Please enter a valid city name' };
  }

  return { isValid: true };
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

// Utility function to validate all user data at once
export const validateUserData = (userData: {
  fullName: string;
  email: string;
  age: number;
  country: string;
  city: string;
  phoneNumber?: string;
}): Record<string, ValidationResult> => {
  return {
    fullName: validateFullName(userData.fullName),
    email: validateEmail(userData.email),
    age: validateAge(userData.age),
    country: validateCountry(userData.country),
    city: validateCity(userData.city),
    phoneNumber: validatePhoneNumber(userData.phoneNumber || '')
  };
};