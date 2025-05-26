export const MOCK_DATA = {
  travel: {
    itineraries: [
      {
        destination: 'Paris',
        days: [
          { day: 1, activities: ['Visit Eiffel Tower', 'Seine River Cruise', 'Louvre Museum'] },
          { day: 2, activities: ['Notre Dame Cathedral', 'Montmartre District', 'Arc de Triomphe'] },
          { day: 3, activities: ['Versailles Palace', 'Champs-Élysées Shopping', 'Evening at Sacré-Cœur'] }
        ],
        estimated_cost: 1200,
        best_time: 'Spring (April-June) or Fall (September-November)'
      },
      {
        destination: 'Tokyo',
        days: [
          { day: 1, activities: ['Senso-ji Temple', 'Tokyo Skytree', 'Traditional Sushi Experience'] },
          { day: 2, activities: ['Shibuya Crossing', 'Harajuku District', 'Meiji Shrine'] },
          { day: 3, activities: ['Tsukiji Fish Market', 'Imperial Palace', 'Ginza Shopping'] }
        ],
        estimated_cost: 1500,
        best_time: 'Spring (March-May) for cherry blossoms'
      }
    ]
  },
  cabs: [
    { id: 'uber_001', driver: 'John Smith', car: 'Honda City', eta: 5, fare: 250, rating: 4.8 },
    { id: 'ola_002', driver: 'Raj Kumar', car: 'Maruti Swift', eta: 7, fare: 220, rating: 4.6 },
    { id: 'uber_003', driver: 'Sarah Johnson', car: 'Toyota Camry', eta: 3, fare: 300, rating: 4.9 }
  ],
  hotels: [
    { id: 'h001', name: 'Grand Palace Hotel', rating: 5, price: 8000, amenities: ['Pool', 'Spa', 'Restaurant'] },
    { id: 'h002', name: 'Budget Inn', rating: 3, price: 2500, amenities: ['WiFi', 'AC'] },
    { id: 'h003', name: 'Luxury Suites', rating: 4, price: 5500, amenities: ['Gym', 'Restaurant', 'Bar'] }
  ],
  restaurants: [
    { id: 'r001', name: 'Spice Garden', cuisine: 'Indian Vegetarian', rating: 4.5, price_range: '₹₹' },
    { id: 'r002', name: 'Ocean Grill', cuisine: 'Continental Non-Veg', rating: 4.7, price_range: '₹₹₹' },
    { id: 'r003', name: 'Green Leaf', cuisine: 'Pure Vegetarian', rating: 4.3, price_range: '₹' }
  ]
} as const;
