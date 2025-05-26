export const SERVICE_TYPES = {
  TRAVEL: 'travel',
  CAB: 'cab',
  HOTEL: 'hotel',
  RESTAURANT: 'restaurant'
} as const;

export type ServiceType = keyof typeof SERVICE_TYPES;

export const QUESTION_FLOWS = {
  [SERVICE_TYPES.TRAVEL]: [
    { key: 'destination', question: 'Where would you like to travel?', type: 'string' },
    { key: 'start_date', question: 'When would you like to start your trip? (YYYY-MM-DD)', type: 'date' },
    { key: 'end_date', question: 'When would you like to end your trip? (YYYY-MM-DD)', type: 'date' },
    { key: 'interests', question: 'What are your main interests? (e.g., culture, adventure, food, history)', type: 'string' }
  ],
  [SERVICE_TYPES.CAB]: [
    { key: 'pickup', question: 'What is your pickup location?', type: 'string' },
    { key: 'drop', question: 'What is your destination?', type: 'string' },
    { key: 'time', question: 'When do you need the cab? (YYYY-MM-DD HH:MM)', type: 'datetime' }
  ],
  [SERVICE_TYPES.HOTEL]: [
    { key: 'city', question: 'Which city are you looking for accommodation in?', type: 'string' },
    { key: 'check_in', question: 'Check-in date? (YYYY-MM-DD)', type: 'date' },
    { key: 'check_out', question: 'Check-out date? (YYYY-MM-DD)', type: 'date' },
    { key: 'guests', question: 'How many guests?', type: 'number' }
  ],
  [SERVICE_TYPES.RESTAURANT]: [
    { key: 'city', question: 'Which city are you looking for restaurants in?', type: 'string' },
    { key: 'date', question: 'What date do you want to dine? (YYYY-MM-DD)', type: 'date' },
    { key: 'people', question: 'How many people will be dining?', type: 'number' },
    { key: 'preference', question: 'Do you prefer vegetarian or non-vegetarian food?', type: 'string' }
  ]
} as const;
