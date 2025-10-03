'use client';

import { useState, useEffect } from 'react';
import { useSession } from '../hooks/use-session';
import { auth } from '../config/firebase-config';

// 🎯 Простой компонент для полного тестирования функционала доставки
// Для новичков: этот компонент позволяет протестировать все API методы

export default function TestDeliveryPage() {
  // 1. STATE (состояние компонента)
  // Это переменные, которые хранят данные и автоматически обновляют UI при изменении

  const [deliveries, setDeliveries] = useState<any[]>([]);  // Список всех доставок
  const [pickers, setPickers] = useState<any[]>([]);        // Список курьеров
  const [loading, setLoading] = useState(false);            // Индикатор загрузки
  const [error, setError] = useState('');                   // Текст ошибки
  const [success, setSuccess] = useState('');               // Текст успеха
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Фильтр по статусу
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null); // Выбранная доставка для редактирования
  const [editMode, setEditMode] = useState(false); // Режим редактирования

  // Данные формы для создания новой доставки
  const [formData, setFormData] = useState({
    title: 'Тестовая посылка',
    description: 'Проверка API',
    fromAddress: 'ул. Ленина 10, Минск',
    toAddress: 'пр. Победителей 5, Гродно',
    price: 150,
    size: 'small',
    weight: 1.5,
    notes: 'Позвонить за 10 минут',
    status: 'pending', // Статус посылки по умолчанию
  });

  // Получаем информацию о пользователе из сессии
  const { user, status } = useSession();

  // 2. API ФУНКЦИИ
  // Функции для взаимодействия с backend сервером
  const API_URL = 'http://localhost:4242'; // ⚠️ Backend сервер на порту 4242, а не 3000!

  // Получить список курьеров (GET /delivery/pickers)
  // Не требует авторизации
  const fetchPickers = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/delivery/pickers`, {
        credentials: 'include', // Отправляет cookies
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPickers(data);
      setSuccess('Курьеры загружены успешно!');
    } catch (err: any) {
      setError(`Ошибка загрузки курьеров: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Получить список доставок (GET /delivery/requests)
  // Требует авторизации через session cookie (FirebaseAuthGuard)
  const fetchDeliveries = async () => {
    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) {
        throw new Error('Нет авторизации. Войдите в систему.');
      }

      console.log('👤 Текущий пользователь UID:', auth.currentUser.uid);
      console.log('👤 Email:', auth.currentUser.email);

      // ⚠️ Важно! credentials: 'include' отправляет session cookie
      const response = await fetch(`${API_URL}/delivery/requests`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Полученные доставки:', data);
      console.log('📦 Количество доставок:', data?.length);
      setDeliveries(data);
      setSuccess(`Доставки загружены успешно! Получено: ${data?.length || 0}`);
    } catch (err: any) {
      setError(`Ошибка загрузки доставок: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Создать новую доставку (POST /delivery/requests)
  // Требует авторизации через session cookie (FirebaseAuthGuard)
  const createDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!auth.currentUser) {
        throw new Error('Нет авторизации. Войдите в систему.');
      }

      // ⚠️ Важно! credentials: 'include' отправляет session cookie
      const response = await fetch(`${API_URL}/delivery/requests`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Ошибка ${response.status}: ${response.statusText}`
        );
      }

      const newDelivery = await response.json();
      console.log('✅ Доставка создана:', newDelivery);

      // Добавляем новую доставку в список
      setDeliveries([newDelivery, ...deliveries]);
      setSuccess(`Доставка #${newDelivery.id} создана успешно!`);

      // Очищаем форму
      setFormData({
        title: '',
        description: '',
        fromAddress: '',
        toAddress: '',
        price: 0,
        size: 'small',
        weight: 0,
        notes: '',
        status: 'pending',
      });
    } catch (err: any) {
      setError(`Ошибка создания доставки: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Обновить данные доставки (PATCH /delivery/requests/:id)
  // Требует авторизации через session cookie (FirebaseAuthGuard)
  // Только отправитель (sender) может редактировать свою доставку
  const updateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!auth.currentUser) {
        throw new Error('Нет авторизации. Войдите в систему.');
      }

      const response = await fetch(`${API_URL}/delivery/requests/${selectedDelivery.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Ошибка ${response.status}: ${response.statusText}`
        );
      }

      const updatedDelivery = await response.json();
      console.log('✅ Доставка обновлена:', updatedDelivery);

      // Обновляем доставку в списке
      setDeliveries(
        deliveries.map((d) => (d.id === selectedDelivery.id ? updatedDelivery : d))
      );
      setSuccess(`Доставка #${selectedDelivery.id} успешно обновлена!`);

      // Выходим из режима редактирования
      setEditMode(false);
      setSelectedDelivery(null);

      // Очищаем форму
      setFormData({
        title: '',
        description: '',
        fromAddress: '',
        toAddress: '',
        price: 0,
        size: 'small',
        weight: 0,
        notes: '',
        status: 'pending',
      });
    } catch (err: any) {
      setError(`Ошибка обновления доставки: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Обновить статус доставки (PUT /delivery/requests/:id/status)
  // Требует авторизации через session cookie (FirebaseAuthGuard)
  // Только курьеры (role: 'picker') могут изменять статус
  const updateDeliveryStatus = async (deliveryId: number, newStatus: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!auth.currentUser) {
        throw new Error('Нет авторизации. Войдите в систему.');
      }

      const response = await fetch(`${API_URL}/delivery/requests/${deliveryId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Ошибка ${response.status}: ${response.statusText}`
        );
      }

      const updatedDelivery = await response.json();
      console.log('✅ Статус доставки обновлен:', updatedDelivery);

      // Обновляем доставку в списке
      setDeliveries(
        deliveries.map((d) => (d.id === deliveryId ? updatedDelivery : d))
      );
      setSuccess(`Статус доставки #${deliveryId} изменен на: ${newStatus}`);
    } catch (err: any) {
      setError(`Ошибка обновления статуса: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Начать редактирование доставки
  const startEdit = (delivery: any) => {
    setSelectedDelivery(delivery);
    setEditMode(true);
    setFormData({
      title: delivery.title,
      description: delivery.description || '',
      fromAddress: delivery.fromAddress,
      toAddress: delivery.toAddress,
      price: delivery.price,
      size: delivery.size,
      weight: delivery.weight || 0,
      notes: delivery.notes || '',
      status: delivery.status,
    });
    // Прокрутить к форме
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Отменить редактирование
  const cancelEdit = () => {
    setEditMode(false);
    setSelectedDelivery(null);
    setFormData({
      title: '',
      description: '',
      fromAddress: '',
      toAddress: '',
      price: 0,
      size: 'small',
      weight: 0,
      notes: '',
      status: 'pending',
    });
  };

  // 3. ОБРАБОТЧИКИ СОБЫТИЙ
  // Функции, которые вызываются при взаимодействии пользователя с формой

  // Обновляет состояние формы при вводе текста
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'weight' ? parseFloat(value) || 0 : value,
    });
  };

  // 4. ФИЛЬТРАЦИЯ ДОСТАВОК
  // Фильтруем доставки по выбранному статусу
  const filteredDeliveries = statusFilter === 'all'
    ? deliveries
    : deliveries.filter(d => d.status === statusFilter);

  // 5. АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ПРИ МОНТИРОВАНИИ КОМПОНЕНТА
  // useEffect выполняется один раз при загрузке компонента
  useEffect(() => {
    fetchPickers(); // Загружаем курьеров сразу
  }, []);

  // 6. JSX РАЗМЕТКА (HTML-подобный синтаксис для React)
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧪 Тестирование Delivery API</h1>

      {/* Информация о сессии */}
      <div style={styles.infoBox}>
        <h3>Информация о пользователе</h3>
        {auth.currentUser ? (
          <div>
            <p>✅ Авторизован</p>
            <p>
              <strong>UID:</strong> {auth.currentUser.uid}
            </p>
            <p>
              <strong>Email:</strong> {auth.currentUser.email}
            </p>
            <p>
              <strong>Статус:</strong> {status}
            </p>
            {user && (
              <>
                <p>
                  <strong>Имя:</strong> {user.name}
                </p>
                <p>
                  <strong>Роль:</strong> {user.role}
                </p>
              </>
            )}
          </div>
        ) : (
          <p style={{ color: '#ff6b6b' }}>❌ Не авторизован. Войдите в систему.</p>
        )}
      </div>

      {/* Блок с уведомлениями */}
      {error && (
        <div style={styles.errorBox}>
          <strong>❌ Ошибка:</strong> {error}
        </div>
      )}

      {success && (
        <div style={styles.successBox}>
          <strong>✅ Успех:</strong> {success}
        </div>
      )}

      {/* Кнопки для тестирования GET запросов */}
      <div style={styles.section}>
        <h2>1️⃣ Тестирование GET запросов</h2>

        <button onClick={fetchPickers} disabled={loading} style={styles.button}>
          {loading ? '⏳ Загрузка...' : '📦 Загрузить курьеров'}
        </button>

        <button
          onClick={fetchDeliveries}
          disabled={loading || !auth.currentUser}
          style={styles.button}
        >
          {loading ? '⏳ Загрузка...' : '🚚 Загрузить мои доставки'}
        </button>
      </div>

      {/* Форма для создания/редактирования доставки */}
      <div style={styles.section}>
        <h2>
          {editMode
            ? `✏️ Редактирование доставки #${selectedDelivery?.id}`
            : '2️⃣ Тестирование POST запроса (создание доставки)'}
        </h2>

        {editMode && (
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#2d4a2d', borderRadius: '4px' }}>
            <p style={{ margin: 0, color: '#6bff6b' }}>
              📝 Режим редактирования активен. Измените нужные поля и нажмите "Сохранить изменения".
            </p>
            <button
              onClick={cancelEdit}
              style={{
                ...styles.button,
                backgroundColor: '#f44336',
                marginTop: '10px',
                marginRight: 0,
              }}
            >
              ❌ Отменить редактирование
            </button>
          </div>
        )}

        <form onSubmit={editMode ? updateDelivery : createDelivery} style={styles.form}>
          <div style={styles.formGroup}>
            <label>
              Название посылки *
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Документы, Цветы, Телефон..."
              />
            </label>
          </div>

          <div style={styles.formGroup}>
            <label>
              Описание
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={styles.textarea}
                placeholder="Хрупкое, срочно..."
              />
            </label>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label>
                Адрес откуда *
                <input
                  type="text"
                  name="fromAddress"
                  value={formData.fromAddress}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="ул. Ленина 10, Минск"
                />
              </label>
            </div>

            <div style={styles.formGroup}>
              <label>
                Адрес куда *
                <input
                  type="text"
                  name="toAddress"
                  value={formData.toAddress}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                  placeholder="пр. Победителей 5, Гродно"
                />
              </label>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label>
                Цена (BYN) *
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  style={styles.input}
                />
              </label>
            </div>

            <div style={styles.formGroup}>
              <label>
                Размер *
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                  style={styles.input}
                >
                  <option value="small">Маленький</option>
                  <option value="medium">Средний</option>
                  <option value="large">Большой</option>
                </select>
              </label>
            </div>

            <div style={styles.formGroup}>
              <label>
                Вес (кг)
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  style={styles.input}
                />
              </label>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label>
              Статус посылки *
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                style={styles.input}
              >
                <option value="pending">🟠 Pending - Ожидает</option>
                <option value="accepted">�� Accepted - Принято</option>
                <option value="picked_up">🟣 Picked Up - Забрано</option>
                <option value="delivered">🟢 Delivered - Доставлено</option>
                <option value="cancelled">🔴 Cancelled - Отменено</option>
              </select>
            </label>
          </div>

          <div style={styles.formGroup}>
            <label>
              Заметки
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                style={styles.textarea}
                placeholder="Позвонить за 10 минут..."
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !auth.currentUser}
            style={{ ...styles.button, ...styles.submitButton }}
          >
            {loading
              ? '⏳ Сохраняем...'
              : editMode
              ? '💾 Сохранить изменения'
              : '✨ Создать доставку'}
          </button>
        </form>
      </div>

      {/* Список курьеров */}
      {pickers.length > 0 && (
        <div style={styles.section}>
          <h2>3️⃣ Список курьеров ({pickers.length})</h2>
          <div style={styles.list}>
            {pickers.map((picker) => (
              <div key={picker.uid} style={styles.card}>
                <h4>{picker.name}</h4>
                <p>
                  <strong>UID:</strong> {picker.uid}
                </p>
                <p>
                  <strong>Роль:</strong> {picker.role}
                </p>
                <p>
                  <strong>Цена:</strong> {picker.price?.toFixed(2)} BYN
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список доставок */}
      {deliveries.length > 0 && (
        <div style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>4️⃣ Мои доставки ({filteredDeliveries.length} из {deliveries.length})</h2>

            {/* Фильтр по статусу */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ color: '#e0e0e0' }}>Фильтр по статусу:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  ...styles.input,
                  width: 'auto',
                  padding: '8px 12px',
                  marginTop: 0,
                }}
              >
                <option value="all">Все статусы</option>
                <option value="pending">🟠 Pending - Ожидает</option>
                <option value="accepted">🔵 Accepted - Принято</option>
                <option value="picked_up">🟣 Picked Up - Забрано</option>
                <option value="delivered">🟢 Delivered - Доставлено</option>
                <option value="cancelled">🔴 Cancelled - Отменено</option>
              </select>
            </div>
          </div>

          <div style={styles.list}>
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} style={styles.card}>
                <h4>
                  #{delivery.id} - {delivery.title}
                </h4>
                <p>
                  <strong>Статус:</strong>{' '}
                  <span style={getStatusStyle(delivery.status)}>{delivery.status}</span>
                </p>
                <p>
                  <strong>Откуда:</strong> {delivery.fromAddress}
                </p>
                <p>
                  <strong>Куда:</strong> {delivery.toAddress}
                </p>
                <p>
                  <strong>Цена:</strong> {delivery.price} BYN
                </p>
                <p>
                  <strong>Размер:</strong> {delivery.size}
                </p>
                {delivery.weight && (
                  <p>
                    <strong>Вес:</strong> {delivery.weight} кг
                  </p>
                )}
                {delivery.description && <p>{delivery.description}</p>}
                {delivery.notes && (
                  <p>
                    <em>Заметки: {delivery.notes}</em>
                  </p>
                )}
                <p style={{ fontSize: '12px', color: '#666' }}>
                  Создано: {new Date(delivery.createdAt).toLocaleString('ru-RU')}
                </p>

                {/* Кнопка редактирования доставки */}
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333' }}>
                  <button
                    onClick={() => startEdit(delivery)}
                    disabled={loading}
                    style={{
                      ...styles.button,
                      backgroundColor: '#FF9800',
                      width: '100%',
                      marginRight: 0,
                      marginBottom: '10px',
                    }}
                  >
                    ✏️ Редактировать доставку
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Инструкции */}
      <div style={styles.section}>
        <h2>📖 Инструкция</h2>
        <ol style={{ textAlign: 'left' }}>
          <li>Убедитесь, что сервер запущен: cd pickom-server && npm run start:dev</li>
          <li>Войдите в систему (если не авторизованы)</li>
          <li>Нажмите "Загрузить курьеров" для проверки GET /delivery/pickers</li>
          <li>Нажмите "Загрузить мои доставки" для проверки GET /delivery/requests</li>
          <li>Заполните форму и нажмите "Создать доставку" для проверки POST</li>
          <li>Нажмите "✏️ Редактировать доставку" для изменения данных (PATCH запрос)</li>
          <li>Измените статус доставки с помощью кнопок для проверки PUT /requests/:id/status</li>
          <li>⚠️ Редактирование доступно только для sender (владельца доставки)</li>
          <li>⚠️ Изменение статуса доступно только для picker</li>
          <li>Проверьте консоль браузера (F12) для подробных логов</li>
        </ol>
      </div>
    </div>
  );
}

// 6. HELPER ФУНКЦИИ
// Вспомогательные функции

// Возвращает стиль для статуса доставки
function getStatusStyle(status: string) {
  const styles: Record<string, React.CSSProperties> = {
    pending: { color: 'orange', fontWeight: 'bold' },
    accepted: { color: 'blue', fontWeight: 'bold' },
    picked_up: { color: 'purple', fontWeight: 'bold' },
    delivered: { color: 'green', fontWeight: 'bold' },
    cancelled: { color: 'red', fontWeight: 'bold' },
  };
  return styles[status] || {};
}

// 7. СТИЛИ (CSS в JS) - ТЁМНАЯ ТЕМА 🌙
// Объект со стилями для компонента
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    color: '#e0e0e0',
  },
  title: {
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: '30px',
    textShadow: '0 0 20px rgba(66, 153, 225, 0.5)',
  },
  infoBox: {
    backgroundColor: '#1a2332',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    color: '#e0e0e0',
  },
  errorBox: {
    backgroundColor: '#2d1517',
    border: '2px solid #f44336',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    color: '#ff6b6b',
  },
  successBox: {
    backgroundColor: '#152d1a',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    color: '#6bff6b',
  },
  section: {
    marginBottom: '40px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '10px',
    marginBottom: '10px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    width: '100%',
    fontSize: '18px',
    padding: '15px',
    boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
  },
  form: {
    marginTop: '20px',
  },
  formGroup: {
    marginBottom: '15px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap' as const,
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #444',
    borderRadius: '4px',
    marginTop: '5px',
    backgroundColor: '#2a2a2a',
    color: '#e0e0e0',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #444',
    borderRadius: '4px',
    marginTop: '5px',
    minHeight: '80px',
    resize: 'vertical' as const,
    backgroundColor: '#2a2a2a',
    color: '#e0e0e0',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  },
  card: {
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#252525',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  statusButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
  },
};
