import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MOCK_DATA } from '../mock-data';
import { MESSAGE_TEMPLATES } from '../message-templates';
import { SERVICE_TYPES, QUESTION_FLOWS } from '../constants';
import { simulateAPIDelay } from '../utils/api';

interface Session {
  sessionId: string;
  serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];
  currentQuestion: number;
  responses: Record<string, string>;
  isComplete: boolean;
  questions: Array<{
    key: string;
    question: string;
    type: string;
  }>;
}

export interface APIResponse {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  message?: string; // Used for user-facing messages
}

export interface BookingState {
  currentSession: Session | null;
  activeBookings: Array<{
    id: string;
    serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];
    status: 'pending' | 'confirmed' | 'cancelled';
    details: Record<string, any>;
    bookingReference?: string;
  }>;
  apiDelay: number;
}

interface BookingActions {
  // Session Management
  startSession: (serviceType: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES]) => {
    success: boolean;
    sessionId?: string;
    question?: string;
    error?: string;
  };
  processResponse: (response: string) => Promise<{
    success: boolean;
    isComplete?: boolean;
    question?: string;
    error?: string;
    message?: string;
  }>;
  getSessionInfo: () => {
    exists: boolean;
    serviceType?: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];
    isComplete?: boolean;
    progress?: string;
  };
  hasIncompleteBooking: () => boolean;  // New method
  endSession: () => void;
  
  // API Operations
  processBooking: () => Promise<APIResponse>;
  
  // Booking Management
  confirmBooking: (bookingDetails: Record<string, any>) => void;
  cancelBooking: (bookingId: string) => void;
  setApiDelay: (delay: number) => void;
}

export const useBookingStore = create<BookingState & BookingActions>()(
  immer((set, get) => ({
    currentSession: null,
    activeBookings: [],
    apiDelay: 500, // Reduced delay for better UX

    // Session Management
    startSession: (serviceType) => {
      if (!QUESTION_FLOWS[serviceType]) {
        return { success: false, error: `Invalid service type: ${serviceType}` };
      }

      const sessionId = Math.random().toString(36).substring(7);
      const session = {
        sessionId,
        serviceType,
        currentQuestion: 0,
        responses: {},
        isComplete: false,
        questions: [...QUESTION_FLOWS[serviceType]] // Create a mutable copy
      };

      set((state) => {
        state.currentSession = session;
      });

      return {
        success: true,
        sessionId,
        question: session.questions[0].question
      };
    },

    hasIncompleteBooking: () => {
      const state = get();
      return !!state.currentSession && !state.currentSession.isComplete;
    },

    processResponse: async (response) => {
      const state = get();
      const session = state.currentSession;
      
      if (!session) {
        return { success: false, error: 'No active session' };
      }

      if (session.isComplete) {
        return { success: false, error: 'Session already completed' };
      }

      // Skip empty response validation as it's handled by the UI
      const currentQuestion = session.questions[session.currentQuestion];

      set((state) => {
        state.currentSession!.responses[currentQuestion.key] = response.trim();
        state.currentSession!.currentQuestion++;

        if (state.currentSession!.currentQuestion >= state.currentSession!.questions.length) {
          state.currentSession!.isComplete = true;
        }
      });

      const updatedState = get();
      const isComplete = updatedState.currentSession!.currentQuestion >= updatedState.currentSession!.questions.length;

      if (isComplete) {
        return {
          success: true,
          isComplete: true,
          message: 'All information collected. Processing your request...'
        };
      }

      return {
        success: true,
        isComplete: false,
        question: updatedState.currentSession!.questions[updatedState.currentSession!.currentQuestion].question
      };
    },

    getSessionInfo: () => {
      const state = get();
      const session = state.currentSession;

      if (!session) {
        return { exists: false };
      }

      return {
        exists: true,
        serviceType: session.serviceType,
        isComplete: session.isComplete,
        progress: `${session.currentQuestion}/${session.questions.length}`
      };
    },

    endSession: () =>
      set((state) => {
        state.currentSession = null;
      }),

    // API Operations
    processBooking: async () => {
      const state = get();
      const session = state.currentSession;

      if (!session?.isComplete) {
        return { success: false, error: 'Session not complete' };
      }

      await simulateAPIDelay(state.apiDelay);

      try {
        const { serviceType, responses } = session;
        let apiResponse: APIResponse;

        switch (serviceType) {
          case SERVICE_TYPES.TRAVEL: {
            const { destination, start_date, end_date, interests } = responses;
            const mockItinerary = MOCK_DATA.travel.itineraries.find(
              item => item.destination.toLowerCase().includes(destination.toLowerCase())
            );

            const defaultItinerary = {
              destination,
              days: [
                {
                  day: 1,
                  activities: ['City Exploration', 'Local Landmarks', 'Local Cuisine'] as string[]
                },
                {
                  day: 2,
                  activities: ['Cultural Tour', 'Shopping', 'Evening Activities'] as string[]
                },
                {
                  day: 3,
                  activities: ['Nature Visit', 'Museum Tour', 'Local Experience'] as string[]
                }
              ],
              estimated_cost: mockItinerary?.estimated_cost ?? 1200,
              best_time: 'Check local weather' as string
            };

            apiResponse = {
              success: true,
              data: {
                ...(mockItinerary ?? defaultItinerary),
                travel_dates: `${start_date} to ${end_date}`,
                interests,
                booking_reference: `TRV_${Date.now()}`
              }
            };
            break;
          }

          case SERVICE_TYPES.CAB: {
            const { pickup, drop, time } = responses;
            const availableCabs = MOCK_DATA.cabs.map(cab => ({
              ...cab,
              pickup_location: pickup,
              drop_location: drop,
              scheduled_time: time
            }));

            apiResponse = {
              success: true,
              data: {
                available_cabs: availableCabs,
                booking_reference: `CAB_${Date.now()}`,
                route: `${pickup} → ${drop}`,
                scheduled_time: time
              }
            };
            break;
          }

          case SERVICE_TYPES.HOTEL: {
            const { city, check_in, check_out, guests } = responses;
            const availableHotels = MOCK_DATA.hotels.map(hotel => ({
              ...hotel,
              city,
              check_in,
              check_out,
              guests,
              availability: 'Available'
            }));

            apiResponse = {
              success: true,
              data: {
                hotels: availableHotels,
                booking_reference: `HTL_${Date.now()}`,
                stay_duration: Math.ceil(
                  (new Date(check_out).getTime() - new Date(check_in).getTime()) / (1000 * 60 * 60 * 24)
                ),
                city,
                check_in,
                check_out,
                guests
              }
            };
            break;
          }

          case SERVICE_TYPES.RESTAURANT: {
            const { city, date, people, preference } = responses;
            const filteredRestaurants = MOCK_DATA.restaurants.filter(restaurant => {
              if (preference.toLowerCase().includes('veg')) {
                return restaurant.cuisine.toLowerCase().includes('vegetarian');
              }
              return true;
            });

            const availableRestaurants = filteredRestaurants.map(restaurant => ({
              ...restaurant,
              city,
              reservation_date: date,
              party_size: people,
              availability: 'Available'
            }));

            apiResponse = {
              success: true,
              data: {
                restaurants: availableRestaurants,
                booking_reference: `RST_${Date.now()}`,
                reservation_date: date,
                city,
                preference,
                party_size: people
              }
            };
            break;
          }

          default:
            return { success: false, error: `Unknown service type: ${serviceType}` };
        }

        // Generate response message using templates
        if (apiResponse.success && apiResponse.data) {
          const template = MESSAGE_TEMPLATES[serviceType]?.success;
          if (template) {
            // Set message at the top level, not in data
            apiResponse.message = template(apiResponse.data);
          }
        }

        return apiResponse;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },

    // Booking Management
    confirmBooking: (bookingDetails) =>
      set((state) => {
        if (state.currentSession) {
          const serviceType = state.currentSession.serviceType;
          state.activeBookings.push({
            id: Math.random().toString(36).substring(7),
            serviceType,
            status: 'confirmed',
            details: bookingDetails,
            bookingReference: bookingDetails.booking_reference,
          });
          // Clear session only after booking is confirmed
          state.currentSession = null;
        }
      }),

    cancelBooking: (bookingId: string) =>
      set((state) => {
        const bookingIndex = state.activeBookings.findIndex((b) => b.id === bookingId);
        if (bookingIndex !== -1) {
          state.activeBookings[bookingIndex].status = 'cancelled';
        }
      }),

    setApiDelay: (delay: number) =>
      set((state) => {
        state.apiDelay = delay;
      })
  })),
);
