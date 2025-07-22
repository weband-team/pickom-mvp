export const MOCK_DELIVERY_REQUESTS = [
  {
    id: '101',
    senderId: '1', // Alice (sender)
    pickerId: null, // пока не назначен
    status: 'pending', // pending | accepted | declined
    from: 'Москва',
    to: 'Санкт-Петербург',
    createdAt: new Date(),
  },
];