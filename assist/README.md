# Multi-Agent Booking System

A sophisticated multi-agent system designed to handle travel itinerary planning, cab booking, and hotel/restaurant reservations through a conversation-driven interface.

## 🚀 Features

- **Travel Itinerary Planning**: Get personalized travel plans based on destination, dates, and interests
- **Cab Booking**: Easy cab reservations with location and time specifications
- **Hotel & Restaurant Reservations**: Book accommodations and dining with detailed preferences
- **Multi-Agent Architecture**:
  - Customer Interaction Agent for gathering information
  - External API Agent for handling service requests
  - Status Communication Agent for providing updates

## 🛠 Tech Stack

- TypeScript
- React
- Tanstack Router (File-based routing)
- Clerk Authentication
- Tailwind CSS (Utility-first styling)
- Shadcn/ui (Component library)
- Zustand with Immer (State management)
- Biome (Linting & Formatting)

## Prerequisites

- Node.js 18.x or higher
- pnpm (Package Manager)

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd assist
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## 📁 Project Structure

```
src/
├── api.ts                   # API endpoints and configurations
├── client.tsx              # Client-side entry point
├── ssr.tsx                 # Server-side rendering setup
├── components/             # UI Components
│   ├── chat-interface.tsx  # Main chat interface
│   ├── ui/                 # Reusable UI components
│   └── ...
├── integrations/
│   ├── agent/             # Multi-agent system implementation
│   ├── clerk/             # Authentication integration
│   └── tanstack-query/    # Data fetching and caching
├── lib/
│   ├── stores/            # Zustand stores
│   └── utils/             # Utility functions
└── routes/                # Application routes
```

## 🤖 Agent System Architecture

### 1. Customer Interaction Agent

- Manages conversation flow
- Collects required information
- Validates user inputs
- Maintains conversation context

### 2. External API Agent

- Handles API calls to various services
- Manages request/response cycles
- Implements retry and error handling
- Simulates external service interactions

### 3. Status Communication Agent

- Provides real-time booking status
- Formats responses for user display
- Handles error communications
- Manages notification delivery

## 💾 State Management

The application uses Zustand with Immer middleware for state management through two main stores:

1. **Conversation Store** (`useConversationStore`)

   - Manages chat messages and history
   - Tracks conversation status (pending/confirmed/cancelled)
   - Handles message threading and timestamps
   - Stores conversation metadata (service type, booking reference)
   - Manages typing indicators
   - Generates success/error messages using templates

2. **Booking Store** (`useBookingStore`)
   - Manages booking session state
   - Handles question flow and validation
   - Processes user responses
   - Simulates API calls with mock data
   - Tracks active bookings and their status
   - Provides booking confirmation and cancellation
   - Manages API interaction delays

## Building and Testing

To build for production:

```bash
pnpm build
```

Testing with Vitest:

```bash
pnpm test
```

## Code Quality

- **Styling**: Using Tailwind CSS for modern, utility-first styling
- **Linting & Formatting**: Using Biome for consistent code style

```bash
pnpm lint
pnpm format
pnpm check
```

## 🔒 Authentication Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Set up environment variables:
   ```
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

## 🎨 UI Components

The project uses [Shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components. Add new components using:

```bash
pnpx shadcn@latest add <component-name>
```

## 🚦 Routing

This project uses [TanStack Router](https://tanstack.com/router) for file-based routing:

- Routes are managed in `src/routes/`
- Layout configuration in `src/routes/__root.tsx`
- Use `<Link>` component for SPA navigation

## 🎯 Usage Examples

### Travel Itinerary Planning

```typescript
1. User: Clicks "Plan Travel" service
2. System: "Where would you like to go?"
3. User: "Paris"
4. System: "When do you plan to start your trip?"
5. User: "2024-06-15"
6. System: "When will your trip end?"
7. User: "2024-06-18"
8. System: "What are your interests? (e.g., culture, food, history)"
9. User: "culture, food, history"
10. System: "✅ Travel itinerary created successfully!
    Booking Reference: TRV_1234567
    Destination: Paris
    Duration: June 15-18, 2024
    Recommended activities based on your interests:
    Day 1: City Exploration, Local Landmarks, Local Cuisine
    Day 2: Cultural Tour, Shopping, Evening Activities
    Day 3: Nature Visit, Museum Tour, Local Experience"
```

### Cab Booking

```typescript
1. User: Clicks "Book Cab" service
2. System: "What's your pickup location?"
3. User: "Mumbai Airport"
4. System: "What's your drop location?"
5. User: "Bandra West"
6. System: "When do you need the cab? (format: YYYY-MM-DD HH:mm)"
7. User: "2024-06-15 14:30"
8. System: "✅ Cab booked successfully!
    Booking Reference: CAB_1234567
    Route: Mumbai Airport → Bandra West
    Pickup Time: 14:30, June 15, 2024
    Driver will arrive 5-10 minutes before pickup time"
```

### Hotel/Restaurant Booking

```typescript
1. User: Clicks "Book Hotel" service
2. System: "Which city are you looking to stay in?"
3. User: "Mumbai"
4. System: "What's your check-in date? (format: YYYY-MM-DD)"
5. User: "2024-06-15"
6. System: "What's your check-out date? (format: YYYY-MM-DD)"
7. User: "2024-06-17"
8. System: "How many guests?"
9. User: "2"
10. System: "✅ Hotel booked successfully!
     Booking Reference: HTL_1234567
     Location: Mumbai
     Stay Duration: 2 nights (June 15-17, 2024)
     Number of Guests: 2
     Check-in Time: After 2 PM
     Check-out Time: Before 11 AM"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
