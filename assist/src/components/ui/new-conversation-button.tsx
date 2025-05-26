import { PlusCircle } from "lucide-react"
import { Button } from "./button"
import { useBookingStore, useConversationStore } from "@/lib/stores"

export function NewConversationButton() {
  const { clearConversation } = useConversationStore()
  const { endSession, hasIncompleteBooking } = useBookingStore()

  const handleClick = () => {
    clearConversation()
    endSession()
    
    // Close sidebar on mobile for better UX
    if (window.innerWidth < 768) {
      const sidebar = document.querySelector('[data-radix-collapsible-content]')
      if (sidebar) {
        ;(sidebar as HTMLElement).style.display = 'none'
      }
    }
  }

  const hasIncomplete = hasIncompleteBooking()
  const tooltipText = hasIncomplete ? "Please complete current booking before starting a new conversation" : "New Conversation"

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="icon"
      title={tooltipText}
      disabled={hasIncomplete}
    >
      <PlusCircle className="h-5 w-5" />
      <span className="sr-only">New Conversation</span>
    </Button>
  )
}
