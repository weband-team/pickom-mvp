export interface PickerCardSettings {
  price: number;
  vehicle: 'car' | 'bike' | 'scooter' | 'walking';
  workArea: string;
  bio: string;
  isOnline: boolean;
}

export const defaultPickerSettings: PickerCardSettings = {
  price: 50,
  vehicle: 'car',
  workArea: 'City Center',
  bio: 'Fast and reliable delivery service',
  isOnline: false,
};

// LocalStorage helpers
export const getPickerSettings = (): PickerCardSettings => {
  if (typeof window === 'undefined') return defaultPickerSettings;

  const saved = localStorage.getItem('pickerCardSettings');
  return saved ? { ...defaultPickerSettings, ...JSON.parse(saved) } : defaultPickerSettings;
};

export const savePickerSettings = (settings: Partial<PickerCardSettings>) => {
  if (typeof window === 'undefined') return;

  const current = getPickerSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem('pickerCardSettings', JSON.stringify(updated));
};

export const toggleOnlineStatus = (): boolean => {
  const current = getPickerSettings();
  const newStatus = !current.isOnline;
  savePickerSettings({ isOnline: newStatus });
  return newStatus;
};

export const getOnlineStatus = (): boolean => {
  return getPickerSettings().isOnline;
};
