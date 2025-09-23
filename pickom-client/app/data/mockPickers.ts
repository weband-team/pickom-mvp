import { Picker } from '../types/picker';

const firstNames = [
  'Adam', 'Bartosz', 'Dawid', 'Filip', 'Grzegorz', 'Jakub', 'Jan', 'Kamil', 'Krzysztof', 'Łukasz',
  'Maciej', 'Marcin', 'Mateusz', 'Michał', 'Paweł', 'Piotr', 'Przemysław', 'Rafał', 'Robert', 'Szymon',
  'Tomasz', 'Wojciech', 'Zbigniew', 'Anna', 'Agnieszka', 'Aleksandra', 'Barbara', 'Beata', 'Ewa',
  'Joanna', 'Justyna', 'Katarzyna', 'Magdalena', 'Małgorzata', 'Maria', 'Monika', 'Natalia', 'Sylwia'
];

const lastNames = [
  'Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński',
  'Szymański', 'Woźniak', 'Dąbrowski', 'Kozłowski', 'Jankowski', 'Mazur', 'Kwiatkowski', 'Krawczyk',
  'Piotrowski', 'Grabowski', 'Nowakowski', 'Pawłowski', 'Michalski', 'Nowicki', 'Adamczyk', 'Dudek',
  'Zając', 'Wieczorek', 'Jabłoński', 'Król', 'Majewski', 'Olszewski', 'Jaworski', 'Malinowski'
];

const vehicles: Array<'car' | 'bike' | 'scooter' | 'walking'> = ['car', 'bike', 'scooter', 'walking'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomPicker(id: number): Picker {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const trustLevel = Math.floor(Math.random() * 100) + 1;
  const basePrice = Math.floor(Math.random() * 20) + 10; // 10-30 zł
  const duration = Math.floor(Math.random() * 45) + 15; // 15-60 мин

  const completedDeliveries = Math.floor(Math.random() * 500) + 10;

  const descriptions = [
    'Experienced delivery professional',
    'Quick and reliable service',
    'Friendly neighborhood courier',
    'Professional package handler',
    'Fast and careful delivery',
    'Trusted local delivery partner'
  ];

  return {
    id: `picker-${id}`,
    name: `${firstName} ${lastName}`,
    description: getRandomElement(descriptions),
    trustLevel,
    price: basePrice,
    duration,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
    reviewCount: Math.floor(Math.random() * 200) + 5,
    isOnline: Math.random() > 0.2, // 80% online
    isVerified: trustLevel > 60, // Verify high trust users
    isPhoneVerified: Math.random() > 0.3, // 70% phone verified
    isEmailVerified: Math.random() > 0.4, // 60% email verified
    distance: Math.round((Math.random() * 5 + 0.5) * 10) / 10, // 0.5-5.5 km
    vehicle: getRandomElement(vehicles),
    completedDeliveries,
    deliveryCount: completedDeliveries // alias for backwards compatibility
  };
}

// Генерируем 50 пикеров для демо
export const mockPickers: Picker[] = Array.from({ length: 50 }, (_, index) =>
  generateRandomPicker(index + 1)
);

// Функция для получения пикеров с пагинацией
export function getPickersPage(page: number, limit: number = 10): Picker[] {
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  return mockPickers.slice(startIndex, endIndex);
}

// Функция для фильтрации пикеров
export function filterPickers(
  pickers: Picker[],
  filters: {
    maxPrice?: number;
    maxDuration?: number;
    minTrustLevel?: number;
    sortBy?: 'price' | 'duration' | 'trust' | 'rating' | 'distance';
    sortOrder?: 'asc' | 'desc';
  }
): Picker[] {
  let filteredPickers = [...pickers];

  // Применяем фильтры
  if (filters.maxPrice) {
    filteredPickers = filteredPickers.filter(p => p.price <= filters.maxPrice!);
  }

  if (filters.maxDuration) {
    filteredPickers = filteredPickers.filter(p => p.duration <= filters.maxDuration!);
  }

  if (filters.minTrustLevel) {
    filteredPickers = filteredPickers.filter(p => p.trustLevel >= filters.minTrustLevel!);
  }

  // Сортировка
  if (filters.sortBy) {
    filteredPickers.sort((a, b) => {
      let aValue: number, bValue: number;

      switch (filters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'trust':
          aValue = a.trustLevel;
          bValue = b.trustLevel;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'distance':
          aValue = a.distance;
          bValue = b.distance;
          break;
        default:
          return 0;
      }

      return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }

  return filteredPickers;
}