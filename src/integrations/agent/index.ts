import { SERVICE_TYPES, type ServiceType, QUESTION_FLOWS } from '@/lib/constants';
import { MOCK_DATA } from '@/lib/mock-data';
import { MESSAGE_TEMPLATES } from '@/lib/message-templates';

interface Session {
  serviceType: ServiceType;
  currentQuestionIndex: number;
  collectedData: Record<string, string>;
  isComplete: boolean;
  questions: typeof QUESTION_FLOWS[ServiceType];
}

interface QuestionResponse {
  isComplete: boolean;
  message?: string;
  question?: string;
  questionKey?: string;
  questionType?: string;
  error?: string;
  collectedData?: Record<string, string>;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
}

// Agent #1: Customer Interaction Agent
class CustomerInteractionAgent {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map();
  }

  startSession(sessionId: string, serviceType: ServiceType): QuestionResponse {
    if (!QUESTION_FLOWS[serviceType]) {
      throw new Error(`Invalid service type: ${serviceType}`);
    }

    this.sessions.set(sessionId, {
      serviceType,
      currentQuestionIndex: 0,
      collectedData: {},
      isComplete: false,
      questions: QUESTION_FLOWS[serviceType]
    });

    return this.getNextQuestion(sessionId);
  }

  getNextQuestion(sessionId: string): QuestionResponse {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.currentQuestionIndex >= session.questions.length) {
      session.isComplete = true;
      return {
        isComplete: true,
        message: 'All information collected. Processing your request...',
        collectedData: session.collectedData
      };
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    return {
      isComplete: false,
      question: currentQuestion.question,
      questionKey: currentQuestion.key,
      questionType: currentQuestion.type
    };
  }

  processResponse(sessionId: string, response: string): QuestionResponse {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.isComplete) {
      return { isComplete: true, error: 'Session already completed' };
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    
    if (!response || response.trim() === '') {
      return {
        isComplete: false,
        error: 'Please provide a valid response',
        question: currentQuestion.question
      };
    }

    session.collectedData[currentQuestion.key] = response.trim();
    session.currentQuestionIndex++;

    return this.getNextQuestion(sessionId);
  }

  getSessionStatus(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { exists: false };
    }

    return {
      exists: true,
      serviceType: session.serviceType,
      isComplete: session.isComplete,
      progress: `${session.currentQuestionIndex}/${session.questions.length}`,
      collectedData: session.collectedData
    };
  }

  endSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}

// Agent #2: External API Agent
class ExternalAPIAgent {
  private apiDelay: number;

  constructor(apiDelay = 1000) {
    this.apiDelay = apiDelay;
  }

  private simulateAPICall(delay = this.apiDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async processTravelRequest(data: Record<string, string>): Promise<APIResponse> {
    await this.simulateAPICall();
    
    try {
      const { destination, start_date, end_date, interests } = data;
      
      let itinerary = MOCK_DATA.travel.itineraries.find(
        item => item.destination.toLowerCase().includes(destination.toLowerCase())
      );

      if (!itinerary) {
        itinerary = {
          destination,
          days: [
            { day: 1, activities: ['Explore city center', 'Visit local landmarks', 'Try local cuisine'] },
            { day: 2, activities: ['Cultural sites tour', 'Shopping districts', 'Evening entertainment'] },
            { day: 3, activities: ['Nature/parks visit', 'Museum tours', 'Local experiences'] }
          ],
          estimated_cost: 1000,
          best_time: 'Check local weather and season recommendations'
        };
      }

      return {
        success: true,
        data: {
          ...itinerary,
          travel_dates: `${start_date} to ${end_date}`,
          interests,
          booking_reference: `TRV_${Date.now()}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process travel request',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processCabRequest(data: Record<string, string>): Promise<APIResponse> {
    await this.simulateAPICall();
    
    try {
      const { pickup, drop, time } = data;
      
      const availableCabs = MOCK_DATA.cabs.map(cab => ({
        ...cab,
        pickup_location: pickup,
        drop_location: drop,
        scheduled_time: time
      }));

      return {
        success: true,
        data: {
          available_cabs: availableCabs,
          booking_reference: `CAB_${Date.now()}`,
          route: `${pickup} → ${drop}`,
          scheduled_time: time
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process cab booking request',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processHotelRequest(data: Record<string, string>): Promise<APIResponse> {
    await this.simulateAPICall();
    
    try {
      const { city, check_in, check_out, guests } = data;
      
      const availableHotels = MOCK_DATA.hotels.map(hotel => ({
        ...hotel,
        city,
        check_in,
        check_out,
        guests,
        availability: 'Available'
      }));

      return {
        success: true,
        data: {
          hotels: availableHotels,
          booking_reference: `HTL_${Date.now()}`,
          stay_duration: this.calculateDays(check_in, check_out),
          city
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process hotel booking request',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processRestaurantRequest(data: Record<string, string>): Promise<APIResponse> {
    await this.simulateAPICall();
    
    try {
      const { city, date, people, preference } = data;
      
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

      return {
        success: true,
        data: {
          restaurants: availableRestaurants,
          booking_reference: `RST_${Date.now()}`,
          reservation_date: date,
          city,
          preference
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process restaurant booking request',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processRequest(serviceType: ServiceType, data: Record<string, string>): Promise<APIResponse> {
    switch (serviceType) {
      case SERVICE_TYPES.TRAVEL:
        return this.processTravelRequest(data);
      case SERVICE_TYPES.CAB:
        return this.processCabRequest(data);
      case SERVICE_TYPES.HOTEL:
        return this.processHotelRequest(data);
      case SERVICE_TYPES.RESTAURANT:
        return this.processRestaurantRequest(data);
      default:
        return {
          success: false,
          error: `Unknown service type: ${serviceType}`
        };
    }
  }
}

// Agent #3: Status Communication Agent
class StatusCommunicationAgent {
  generateSuccessMessage(serviceType: ServiceType, data: any): string {
    const template = MESSAGE_TEMPLATES[serviceType]?.success;
    if (!template) {
      return `✅ Your ${serviceType} request has been processed successfully!`;
    }
    return template(data);
  }

  generateErrorMessage(serviceType: ServiceType, error: string): string {
    const template = MESSAGE_TEMPLATES[serviceType]?.error;
    if (!template) {
      return `❌ Sorry, there was an error processing your ${serviceType} request: ${error}`;
    }
    return template(error);
  }

  processAPIResponse(serviceType: ServiceType, apiResponse: APIResponse) {
    if (apiResponse.success) {
      return {
        success: true,
        message: this.generateSuccessMessage(serviceType, apiResponse.data),
        data: apiResponse.data
      };
    } else {
      return {
        success: false,
        message: this.generateErrorMessage(serviceType, apiResponse.error || 'Unknown error'),
        error: apiResponse.error
      };
    }
  }
}

// Main Multi-Agent System Orchestrator
class MultiAgentBookingSystem {
  private customerAgent: CustomerInteractionAgent;
  private apiAgent: ExternalAPIAgent;
  private statusAgent: StatusCommunicationAgent;
  private activeSessions: Set<string>;

  constructor() {
    this.customerAgent = new CustomerInteractionAgent();
    this.apiAgent = new ExternalAPIAgent();
    this.statusAgent = new StatusCommunicationAgent();
    this.activeSessions = new Set();
  }

  startBooking(sessionId: string, serviceType: ServiceType) {
    try {
      if (this.activeSessions.has(sessionId)) {
        throw new Error(`Session ${sessionId} already exists`);
      }

      this.activeSessions.add(sessionId);
      const result = this.customerAgent.startSession(sessionId, serviceType);
      
      return {
        success: true,
        sessionId,
        serviceType,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processCustomerResponse(sessionId: string, response: string) {
    try {
      const result = this.customerAgent.processResponse(sessionId, response);
      
      if (result.error) {
        return {
          success: false,
          error: result.error,
          question: result.question
        };
      }

      if (result.isComplete && result.collectedData) {
        const sessionStatus = this.customerAgent.getSessionStatus(sessionId);
        const apiResponse = await this.apiAgent.processRequest(
          sessionStatus.serviceType,
          result.collectedData
        );

        const finalMessage = this.statusAgent.processAPIResponse(
          sessionStatus.serviceType,
          apiResponse
        );

        this.customerAgent.endSession(sessionId);
        this.activeSessions.delete(sessionId);

        return {
          success: true,
          isComplete: true,
          ...finalMessage
        };
      }

      return {
        success: true,
        isComplete: false,
        ...result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getSessionInfo(sessionId: string) {
    return this.customerAgent.getSessionStatus(sessionId);
  }

  getAvailableServices(): ServiceType[] {
    return Object.values(SERVICE_TYPES);
  }

  cancelSession(sessionId: string) {
    this.customerAgent.endSession(sessionId);
    this.activeSessions.delete(sessionId);
    return { success: true, message: 'Session cancelled successfully' };
  }
}

// Example conversation data
const createExampleConversations = () => ({
  travel: {
    service: SERVICE_TYPES.TRAVEL as ServiceType,
    responses: ['Paris', '2024-06-15', '2024-06-18', 'culture, food, history']
  },
  cab: {
    service: SERVICE_TYPES.CAB as ServiceType,
    responses: ['Mumbai Airport', 'Bandra West', '2024-06-15 14:30']
  },
  hotel: {
    service: SERVICE_TYPES.HOTEL as ServiceType,
    responses: ['Mumbai', '2024-06-15', '2024-06-17', '2']
  },
  restaurant: {
    service: SERVICE_TYPES.RESTAURANT as ServiceType,
    responses: ['Delhi', '2024-06-15', '4', 'vegetarian']
  }
});

// Simulation function
const simulateConversation = async (
  bookingSystem: MultiAgentBookingSystem,
  example: { service: ServiceType; responses: string[] }
) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const conversation: Array<{ type: 'user' | 'system'; message: string }> = [];
  
  const startResult = bookingSystem.startBooking(sessionId, example.service);
  conversation.push({
    type: 'system',
    message: startResult.question || startResult.error || 'Failed to start session'
  });

  if (!startResult.success) {
    return conversation;
  }

  for (const response of example.responses) {
    conversation.push({
      type: 'user',
      message: response
    });

    const result = await bookingSystem.processCustomerResponse(sessionId, response);
    
    if (result.isComplete) {
      conversation.push({
        type: 'system',
        message: result.message || 'Session completed'
      });
      break;
    } else {
      conversation.push({
        type: 'system',
        message: result.question || result.error || 'Unknown response'
      });
    }
  }

  return conversation;
};

export {
  MultiAgentBookingSystem,
  CustomerInteractionAgent,
  ExternalAPIAgent,
  StatusCommunicationAgent,
  createExampleConversations,
  simulateConversation,
  type ServiceType
};

export default MultiAgentBookingSystem;
