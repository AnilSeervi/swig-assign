export type MessageTemplate = {
  success: (data: any) => string;
  error: (error: string) => string;
};

export const MESSAGE_TEMPLATES: Record<string, MessageTemplate> = {
  travel: {
    success: (data) => `🎉 Great! I've found an amazing itinerary for ${data.destination}!\n\n` +
      `📅 Travel Dates: ${data.travel_dates}\n` +
      `💰 Estimated Cost: $${data.estimated_cost}\n` +
      `🎯 Based on your interests: ${data.interests}\n` +
      `📋 Booking Reference: ${data.booking_reference}\n\n` +
      `Here's your day-by-day plan:\n` +
      data.days.map((day: any) => `Day ${day.day}: ${day.activities.join(', ')}`).join('\n'),
    error: (error) => `❌ Sorry, I couldn't process your travel request. ${error}`
  },
  cab: {
    success: (data) => `🚗 Great! I found available cabs for your trip!\n\n` +
      `📍 Route: ${data.route}\n` +
      `⏰ Scheduled Time: ${data.scheduled_time}\n` +
      `📋 Booking Reference: ${data.booking_reference}\n\n` +
      `Available Options:\n` +
      data.available_cabs.map((cab: any) => 
        `🚙 ${cab.car} - Driver: ${cab.driver} | ETA: ${cab.eta} mins | Fare: ₹${cab.fare} | Rating: ${cab.rating}⭐`
      ).join('\n'),
    error: (error) => `❌ Sorry, I couldn't find available cabs. ${error}`
  },
  hotel: {
    success: (data) => `🏨 Excellent! I found great hotel options in ${data.city}!\n\n` +
      `📅 Check-in: ${data.check_in} | Check-out: ${data.check_out}\n` +
      `👥 Guests: ${data.guests}\n` +
      `📋 Booking Reference: ${data.booking_reference}\n\n` +
      `Available Hotels:\n` +
      data.hotels.map((hotel: any) => 
        `🏨 ${hotel.name} | ${hotel.rating}⭐ | ₹${hotel.price}/night | Amenities: ${hotel.amenities.join(', ')}`
      ).join('\n'),
    error: (error) => `❌ Sorry, I couldn't find available hotels. ${error}`
  },
  restaurant: {
    success: (data) => `🍽️ Perfect! I found excellent restaurants in ${data.city}!\n\n` +
      `📅 Reservation Date: ${data.reservation_date}\n` +
      `👥 Party Size: ${data.party_size}\n` +
      `🥗 Preference: ${data.preference}\n` +
      `📋 Booking Reference: ${data.booking_reference}\n\n` +
      `Available Restaurants:\n` +
      data.restaurants.map((restaurant: any) => 
        `🍽️ ${restaurant.name} | ${restaurant.cuisine} | ${restaurant.rating}⭐ | ${restaurant.price_range}`
      ).join('\n'),
    error: (error) => `❌ Sorry, I couldn't find available restaurants. ${error}`
  }
} as const;
