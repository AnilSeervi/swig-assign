import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowUp, Car, Plane, Hotel, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useBookingStore, useConversationStore } from "@/lib/stores"
import { SERVICE_TYPES, QUESTION_FLOWS } from "@/lib/constants"
import { DatePicker } from "@/components/ui/date-picker"
import { validateDate, validateDateTime, validateNumber } from "@/lib/schemas"

interface QuestionFlow {
  key: string;
  question: string;
  type: 'string' | 'date' | 'datetime' | 'number';
}

export default function ChatInterface() {
  // Store hooks
  const { 
    currentConversationId,
    isTyping,
    addUserMessage, 
    addSystemMessage,
    setTyping,
    createNewConversation, 
  } = useConversationStore();

  // Keep track of validation errors
  const [hasValidationError, setHasValidationError] = useState(false);

  // Helper function to update error message while preserving the question
  const updateErrorMessage = (question: string, error: string) => {
    const lastMessageIndex = messages.length - 1;
    if (lastMessageIndex >= 0) {
      const updatedMessages = [...messages];
      updatedMessages[lastMessageIndex] = {
        ...updatedMessages[lastMessageIndex],
        content: `${question}\n\n❌ ${error}\n\nPlease provide a valid value.`
      };
      useConversationStore.setState(state => ({
        conversations: state.conversations.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, messages: updatedMessages }
            : conv
        )
      }));
    }
    setHasValidationError(true);
    setTyping(false);
  };

  const clearValidationError = () => {
    if (hasValidationError) {
      setHasValidationError(false);
      setTyping(false); // Ensure typing state is cleared
      // Restore the original question
      const lastMessageIndex = messages.length - 1;
      if (lastMessageIndex >= 0 && messages[lastMessageIndex]) {
        const updatedMessages = [...messages];
        // Remove error message and restore original question
        const originalQuestion = updatedMessages[lastMessageIndex].content.split('\n\n')[0];
        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          content: originalQuestion
        };
        useConversationStore.setState(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === currentConversationId
              ? { ...conv, messages: updatedMessages }
              : conv
          )
        }));
      }
    }
  };

  const { 
    currentSession,
    processResponse,
    processBooking,
    startSession,
    getSessionInfo
  } = useBookingStore();

  // Local state
  const [inputValue, setInputValue] = useState("")
  const [hasTyped, setHasTyped] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showServiceSelection, setShowServiceSelection] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  // Used for syncing state when new conversation is clicked
  useEffect(() => {
    setShowServiceSelection(!currentSession?.sessionId && !currentConversationId)
  }, [currentSession?.sessionId, currentConversationId])
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const mainContainerRef = useRef<HTMLDivElement>(null)

  // Service selection handler
  const handleServiceSelect = async (serviceType: keyof typeof SERVICE_TYPES, label: string) => {
    setShowServiceSelection(false)
    
    // Create a new conversation and start the session
    createNewConversation(SERVICE_TYPES[serviceType]);
    addUserMessage(label)
    
    // Start the session
    const result = await startSession(SERVICE_TYPES[serviceType])
    if (result.success) {
      addSystemMessage(result.question || "Let's get started with your booking.")
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    } else {
      addSystemMessage(`❌ ${result.error || "Something went wrong"}`)
    }
  }

  // Check if device is mobile and get viewport height
  useEffect(() => {
    const checkMobileAndViewport = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
      
      if (isMobileDevice && mainContainerRef.current) {
        mainContainerRef.current.style.height = `${window.innerHeight}px`
      }
    }

    checkMobileAndViewport()
    window.addEventListener("resize", checkMobileAndViewport)
    return () => window.removeEventListener("resize", checkMobileAndViewport)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentConversationId])

  // Handle input focus
  useEffect(() => {
    if (!isTyping && !isMobile && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isTyping, isMobile])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isTyping) {
      // Clear any existing validation errors when user starts typing
      if (hasValidationError) {
        clearValidationError();
      }
      setInputValue(e.target.value)
      if (!hasTyped && e.target.value.trim()) {
        setHasTyped(true)
      }
    }
  }

  // Helper to determine if a question requires date input
  const isDateQuestion = (type: string) => type === 'date' || type === 'datetime'

  // Handle date selection and submission
  const handleDateSelect = (date?: Date, submit?: boolean) => {
    // Clear any existing validation errors when user makes a new selection
    if (hasValidationError) {
      clearValidationError();
    }

    if (date) {
      setSelectedDate(date)
      
      if (submit) {
        setTyping(true); // Set typing state at start of validation
        
        // Get current question to determine format
        const currentFlow = currentSession 
          ? QUESTION_FLOWS[currentSession.serviceType] as readonly QuestionFlow[]
          : null;
        const currentQuestion = currentFlow?.find(q => q.question === messages[messages.length - 1]?.content);
        
        if (!currentQuestion) {
          setTyping(false);
          return;
        }

        // Format and validate based on question type
        const formattedDate = currentQuestion.type === 'datetime' 
          ? `${date.toISOString().split('T')[0]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
          : date.toISOString().split('T')[0];

        // Validate the formatted date
        const validation = currentQuestion.type === 'datetime' 
          ? validateDateTime(formattedDate)
          : validateDate(formattedDate);

        if (!validation.isValid) {
          // Show error and keep the current question active
          updateErrorMessage(currentQuestion.question, validation.error || "Invalid input");
          return;
        }

        // Only add user message and clear date if validation passes
        addUserMessage(formattedDate)
        setSelectedDate(undefined)
        
        // Process the response
        if (!currentSession) {
          addSystemMessage("❌ No active session. Please select a service first.")
          return;
        }

        processResponse(formattedDate).then(response => {
          if (response.success) {
            if (response.isComplete) {
              processBooking().then(bookingResult => {
                if (bookingResult.success) {
                  if (bookingResult.message) {
                    addSystemMessage(bookingResult.message)
                  } else {
                    addSystemMessage(`✅ Booking completed successfully!`)
                  }
                } else {
                  addSystemMessage(`❌ ${bookingResult.error || 'Failed to process booking'}`)
                }
              })
            } else {
              addSystemMessage(response.question || "What else would you like to know?")
            }
          } else {
            addSystemMessage(response.error || "Sorry, I didn't understand that")
          }
        }).catch(error => {
          console.error('Error in handleDateSelect:', error)
          addSystemMessage(error instanceof Error ? `❌ ${error.message}` : "❌ An error occurred while processing your request")
        }).finally(() => {
          setTyping(false)
        })
      }
    }
  }

  // Modified submit handler
  const handleSubmit = async () => {
    if (!inputValue.trim() && !selectedDate) return
    setTyping(true) // Set typing state at the start
    
    const currentQuestion = currentSession && messages.length > 0
      ? (QUESTION_FLOWS[currentSession.serviceType] as readonly QuestionFlow[])
          ?.find(q => q.question === messages[messages.length - 1]?.content)
      : null;

    if (!currentQuestion) {
      setTyping(false);
      return;
    }

    // Validate input based on question type
    if (currentQuestion.type === 'number') {
      const validation = validateNumber(inputValue.trim());
      if (!validation.isValid) {
        // Show error and keep the current question active
        updateErrorMessage(currentQuestion.question, validation.error || "Value must be a number");
        setInputValue(""); // Clear the invalid input
        return;
      }
    }
    
    // Only add user message and clear input if validation passes
    addUserMessage(inputValue)
    setInputValue("")
    setHasTyped(false)
    setSelectedDate(undefined)
    
    // Process the message
    try {
      if (!currentSession) {
        addSystemMessage("❌ No active session. Please select a service first.")
        return;
      }

      const response = await processResponse(inputValue)
      
      if (response.success) {
        if (response.isComplete) {
          const bookingResult = await processBooking()
          if (bookingResult.success) {
            if (bookingResult.message) {
              addSystemMessage(bookingResult.message)
            } else {
              const message = `✅ Booking completed successfully!`
              addSystemMessage(message)
            }
          } else {
            addSystemMessage(`❌ ${bookingResult.error || 'Failed to process booking'}`)
          }
        } else {
          addSystemMessage(response.question || "What else would you like to know?")
        }
      } else {
        addSystemMessage(response.error || "Sorry, I didn't understand that")
      } 
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      addSystemMessage(error instanceof Error ? `❌ ${error.message}` : "❌ An error occurred while processing your request")
    } finally {
      setTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if ((!isMobile && !e.shiftKey) || (e.metaKey)) {
        e.preventDefault()
        handleSubmit()
      }
    }
  }

  const renderServiceButtons = () => {
    const services = [
      { type: "CAB" as keyof typeof SERVICE_TYPES, icon: Car, label: "Book a Cab", description: "Quick and convenient cab bookings" },
      { type: "TRAVEL" as keyof typeof SERVICE_TYPES, icon: Plane, label: "Plan Travel", description: "Plan your perfect trip itinerary" },
      { type: "HOTEL" as keyof typeof SERVICE_TYPES, icon: Hotel, label: "Reserve Hotel", description: "Find and book ideal accommodations" },
      { type: "RESTAURANT" as keyof typeof SERVICE_TYPES, icon: UtensilsCrossed, label: "Reserve Restaurant", description: "Table reservations at top restaurants" },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto px-4 mb-8">
        {services.map(({ type, icon: Icon, label, description }) => (
          <button
            key={type}
            onClick={() => handleServiceSelect(type, label)}
            disabled={isTyping}
            className={cn(
              "relative overflow-hidden rounded-xl border bg-background p-6 shadow-md transition-all hover:shadow-lg",
              "text-left",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </button>
        ))}
      </div>
    );
  };

  // Get current conversation messages
  const currentConversation = useConversationStore(state => 
    state.conversations.find(c => c.id === state.currentConversationId)
  );
  const messages = currentConversation?.messages ?? [];
  
  // Get session info to check if booking is complete
  const sessionInfo = getSessionInfo();
  const showInputForm = currentSession && !sessionInfo.isComplete;

  // Helper to determine if current question requires a date input
  const isCurrentQuestionDateType = () => {
    if (!currentSession || !messages.length) return false;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type !== 'system') return false;

    const currentFlow = QUESTION_FLOWS[currentSession.serviceType] as readonly QuestionFlow[];
    const currentQuestion = currentFlow?.find((q: QuestionFlow) => q.question === lastMessage.content);
    
    return currentQuestion && isDateQuestion(currentQuestion.type);
  }

  return (
    <div
      ref={mainContainerRef}
      className="flex h-[calc(100vh-61px)] flex-col overflow-hidden bg-background relative mt-4"
    >
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pb-[120px]"
      >
        <div className="mx-auto max-w-3xl">
          {showServiceSelection ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
              <h2 className="text-2xl font-bold text-center mb-8">What would you like to do?</h2>
              {renderServiceButtons()}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "mb-6 flex w-full flex-col px-4",
                    message.type === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 whitespace-pre-wrap",
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {(() => {
                      // Check if this is a system message with a date/datetime question
                      if (message.type === 'system' && currentSession?.sessionId) {

                        const currentFlow = QUESTION_FLOWS[currentSession.serviceType] as readonly QuestionFlow[];
                        const currentQuestion = currentFlow?.find((q: QuestionFlow) => q.question === message.content);
                        
                        if (currentQuestion && isDateQuestion(currentQuestion.type)) {
                          return (
                            <div className="flex flex-col gap-4">
                              <div>{message.content}</div>
                              {selectedDate ? (
                                <div className="flex flex-col gap-2">
                                  <div className="text-sm text-muted-foreground">
                                    Selected: {selectedDate.toLocaleDateString('en-US', { 
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                  <DatePicker
                                    date={selectedDate}
                                    setDate={handleDateSelect}
                                    className="bg-background text-sm"
                                    questionType={currentQuestion.type as 'date' | 'datetime'}
                                    disabled={isTyping || message !== messages[messages.length - 1]}
                                    defaultOpen={false}
                                  />
                                </div>
                              ) : (
                                <DatePicker
                                  date={selectedDate}
                                  setDate={handleDateSelect}
                                  className="bg-background text-sm"
                                  questionType={currentQuestion.type as 'date' | 'datetime'}
                                  disabled={isTyping || message !== messages[messages.length - 1]}
                                  defaultOpen={message === messages[messages.length - 1]}
                                />
                              )}
                            </div>
                          );
                        }
                      }
                      return message.content;
                    })()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {showInputForm && (
        <div className="bg-gradient-to-b from-background/30 to-background/90 absolute bottom-0 left-0 right-0 p-4">
          <form
            onSubmit={handleSubmit}
            className="flex max-w-3xl mx-auto items-end gap-4"
          >
            <div
              ref={inputContainerRef}
              className="relative flex-1"
              onClick={() => textareaRef.current?.focus()}
            >
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={isTyping ? "Processing..." : currentSession && isCurrentQuestionDateType() ? "Please use the date picker above" : "Ask anything..."}
                disabled={isTyping || (currentSession && isCurrentQuestionDateType())}
                className={cn(
                  "min-h-[60px] w-full resize-none bg-background p-4 pr-12",
                  "focus:ring-0 focus:ring-offset-0",
                  (isTyping || (currentSession && isCurrentQuestionDateType())) && "opacity-80"
                )}
                rows={1}
              />
              {!isCurrentQuestionDateType() && (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || isTyping}
                  className={cn(
                    "absolute right-4 top-4 h-6 w-6",
                    !inputValue.trim() && "opacity-0",
                    inputValue.trim() && "opacity-100 transition-opacity"
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
