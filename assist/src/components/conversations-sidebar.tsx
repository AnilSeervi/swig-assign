import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useConversationStore } from "@/lib/stores"

export function ConversationsSidebar() {
  const { 
    conversations,
    currentConversationId,
    setActiveConversation,
  } = useConversationStore()

  const sortedConversations = React.useMemo(() => {
    return [...conversations].sort((a, b) => {
      // Always show confirmed conversations first
      if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
      if (b.status === 'confirmed' && a.status !== 'confirmed') return 1;
      // Then sort by most recent
      return b.messages[b.messages.length - 1].timestamp - a.messages[a.messages.length - 1].timestamp;
    });
  }, [conversations]);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sortedConversations.map((conversation) => {
                // Get the most recent message
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const preview = lastMessage?.content.slice(0, 30) + (lastMessage?.content.length > 30 ? '...' : '');
                
                return (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      isActive={currentConversationId === conversation.id}
                      className="justify-between"
                      onClick={() => setActiveConversation(conversation.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {conversation.serviceType.toLowerCase()}
                          </span>
                          {conversation.status === 'confirmed' && (
                            <SidebarMenuBadge>✅</SidebarMenuBadge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {preview}
                        </p>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
