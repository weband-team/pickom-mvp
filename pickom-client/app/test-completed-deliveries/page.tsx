'use client';

import { useState, useEffect } from 'react';
import { useSession } from '../hooks/use-session';
import { auth } from '../config/firebase-config';

// Компонент для тестирования получения успешно выполненных заказов Picker'а
// Использует эндпоинт GET /delivery/completed

export default function TestCompletedDeliveriesPage() {
  // STATE (состояние компонента)
  const [completedDeliveries, setCompletedDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Получаем информацию о пользователе из сессии
  const { user, status } = useSession();

  // API URL
  const API_URL = 'http://localhost:4242';

  // Получить завершенные доставки (GET /delivery/completed)
  // Требует авторизации через session cookie (FirebaseAuthGuard)
  const fetchCompletedDeliveries = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!auth.currentUser) {
        throw new Error('Нет авторизации. Войдите в систему.');
      }

      console.log('Текущий пользователь UID:', auth.currentUser.uid);
      console.log('Email:', auth.currentUser.email);

      // Важно! credentials: 'include' отправляет session cookie
      const response = await fetch(`${API_URL}/delivery/completed`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Полученные завершенные доставки:', data);
      console.log('Количество завершенных доставок:', data?.length);
      setCompletedDeliveries(data);
      setSuccess(`Завершенные доставки загружены успешно! Получено: ${data?.length || 0}`);
    } catch (err: any) {
      setError(`Ошибка загрузки завершенных доставок: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Автоматическая загрузка при монтировании компонента
  useEffect(() => {
    if (auth.currentUser) {
      fetchCompletedDeliveries();
    }
  }, []);

  // Расчет общего заработка
  const totalEarnings = completedDeliveries.reduce((sum, delivery) => sum + Number(delivery.price), 0);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Завершенные доставки Picker'а</h1>

      {/* Информация о сессии */}
      <div style={styles.infoBox}>
        <h3>Информация о пользователе</h3>
        {auth.currentUser ? (
          <div>
            <p>Авторизован</p>
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
          <p style={{ color: '#ff6b6b' }}>Не авторизован. Войдите в систему.</p>
        )}
      </div>

      {/* Блок с уведомлениями */}
      {error && (
        <div style={styles.errorBox}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {success && (
        <div style={styles.successBox}>
          <strong>Успех:</strong> {success}
        </div>
      )}

      {/* Кнопка для обновления данных */}
      <div style={styles.section}>
        <button
          onClick={fetchCompletedDeliveries}
          disabled={loading || !auth.currentUser}
          style={styles.button}
        >
          {loading ? 'Загрузка...' : 'Обновить данные'}
        </button>
      </div>

      {/* Статистика */}
      {completedDeliveries.length > 0 && (
        <div style={styles.statsBox}>
          <h3>Статистика</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{completedDeliveries.length}</div>
              <div style={styles.statLabel}>Завершено доставок</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{totalEarnings.toFixed(2)} BYN</div>
              <div style={styles.statLabel}>Общий заработок</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {completedDeliveries.length > 0
                  ? (totalEarnings / completedDeliveries.length).toFixed(2)
                  : '0.00'} BYN
              </div>
              <div style={styles.statLabel}>Средний заработок</div>
            </div>
          </div>
        </div>
      )}

      {/* Список завершенных доставок */}
      {completedDeliveries.length > 0 ? (
        <div style={styles.section}>
          <h2>Список завершенных доставок ({completedDeliveries.length})</h2>
          <div style={styles.list}>
            {completedDeliveries.map((delivery) => (
              <div key={delivery.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>
                    #{delivery.id} - {delivery.title}
                  </h4>
                  <span style={styles.statusBadge}>
                    Доставлено
                  </span>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Откуда:</span>
                    <span style={styles.infoValue}>{delivery.fromAddress}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Куда:</span>
                    <span style={styles.infoValue}>{delivery.toAddress}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Цена:</span>
                    <span style={styles.priceValue}>{delivery.price} BYN</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Размер:</span>
                    <span style={styles.infoValue}>{getSizeLabel(delivery.size)}</span>
                  </div>

                  {delivery.weight && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Вес:</span>
                      <span style={styles.infoValue}>{delivery.weight} кг</span>
                    </div>
                  )}

                  {delivery.description && (
                    <div style={styles.descriptionBox}>
                      <strong>Описание:</strong> {delivery.description}
                    </div>
                  )}

                  {delivery.notes && (
                    <div style={styles.notesBox}>
                      <strong>Заметки:</strong> {delivery.notes}
                    </div>
                  )}

                  <div style={styles.dateInfo}>
                    <div>
                      <strong>Создано:</strong>{' '}
                      {new Date(delivery.createdAt).toLocaleString('ru-RU')}
                    </div>
                    <div>
                      <strong>Обновлено:</strong>{' '}
                      {new Date(delivery.updatedAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !loading && (
          <div style={styles.emptyState}>
            <p>У вас пока нет завершенных доставок</p>
            <p style={{ fontSize: '14px', color: '#888', marginTop: '10px' }}>
              Завершенные доставки появятся здесь после успешной доставки посылок
            </p>
          </div>
        )
      )}

      {/* Инструкции */}
      <div style={styles.section}>
        <h2>Инструкция</h2>
        <ol style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <li>Убедитесь, что сервер запущен: cd pickom-server && npm run start:dev</li>
          <li>Войдите в систему как пользователь с ролью 'picker'</li>
          <li>Страница автоматически загрузит завершенные доставки при загрузке</li>
          <li>Используйте кнопку "Обновить данные" для повторной загрузки</li>
          <li>Просмотрите статистику по заработку и количеству доставок</li>
          <li>Проверьте консоль браузера (F12) для подробных логов</li>
        </ol>
      </div>
    </div>
  );
}

// HELPER ФУНКЦИИ

// Возвращает читаемое название размера
function getSizeLabel(size: string): string {
  const sizeLabels: Record<string, string> = {
    small: 'Маленький',
    medium: 'Средний',
    large: 'Большой',
  };
  return sizeLabels[size] || size;
}

// СТИЛИ (CSS в JS) - ТЁМНАЯ ТЕМА
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
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)',
  },
  statsBox: {
    backgroundColor: '#1a1a1a',
    border: '2px solid #2196F3',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  statCard: {
    backgroundColor: '#252525',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: '10px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#999',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    border: '1px solid #333',
    borderRadius: '8px',
    backgroundColor: '#252525',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#1a472a',
    padding: '15px',
    borderBottom: '1px solid #2d5a3d',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    margin: 0,
    color: '#fff',
    fontSize: '18px',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: '15px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid #333',
  },
  infoLabel: {
    color: '#999',
    fontSize: '14px',
  },
  infoValue: {
    color: '#e0e0e0',
    fontSize: '14px',
    textAlign: 'right',
  },
  priceValue: {
    color: '#4CAF50',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  descriptionBox: {
    backgroundColor: '#1a1a1a',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
    fontSize: '14px',
    color: '#ccc',
  },
  notesBox: {
    backgroundColor: '#2d2d1a',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
    fontSize: '14px',
    color: '#e0e0a0',
    fontStyle: 'italic',
  },
  dateInfo: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #333',
    fontSize: '12px',
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    border: '2px dashed #444',
    borderRadius: '8px',
    padding: '60px 20px',
    textAlign: 'center',
    color: '#888',
    fontSize: '18px',
  },
};
