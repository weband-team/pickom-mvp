# Google Maps API Setup Instructions

## Получение API ключа Google Maps

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите следующие API:
   - Maps JavaScript API
   - Places API
   - Geocoding API

## Настройка в проекте

1. Создайте файл `.env.local` в корне проекта:
```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Development environment
NODE_ENV=development
```

2. Замените `your_actual_api_key_here` на ваш реальный API ключ

## Ограничения API ключа (рекомендуется)

В Google Cloud Console настройте ограничения для вашего API ключа:

### Ограничения приложения:
- HTTP referrers (web sites)
- Добавьте домены: `localhost:3000/*`, `127.0.0.1:3000/*`

### Ограничения API:
- Maps JavaScript API
- Places API  
- Geocoding API

## Проверка работы

После настройки API ключа:

1. Перезапустите сервер разработки: `npm run dev`
2. Перейдите на страницу `/send-package`
3. Попробуйте ввести адрес в поля "Pickup Location" или "Drop-off Location"
4. Должны появиться предложения адресов
5. Нажмите на кнопку 📍 для открытия карты

## Возможные проблемы

### Если автозаполнение не работает:
- Проверьте правильность API ключа
- Убедитесь что включены необходимые API
- Проверьте ограничения API ключа
- Откройте Developer Tools и проверьте консоль на наличие ошибок

### Если карта не загружается:
- Убедитесь что включен Maps JavaScript API
- Проверьте квоты использования API
- Проверьте настройки биллинга в Google Cloud

## Полезные ссылки

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript) 