import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { getAuth } from '@clerk/tanstack-react-start/server'
import ChatInterface from '@/components/chat-interface'
import ClerkHeader from '@/integrations/clerk/header-user.tsx'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ConversationsSidebar } from '@/components/conversations-sidebar'
import { NewConversationButton } from '@/components/ui/new-conversation-button'

const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  if (!request) throw new Error('No request found')
  const { userId } = await getAuth(request)

  if (!userId) {
    throw redirect({
      to: '/login',
    })
  }

  return { userId }
})

export const Route = createFileRoute('/')({
  component: App,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return { userId: context.userId }
  },
})

function App() {
  return (
    <SidebarProvider>
      <ConversationsSidebar />
      <div className="min-h-screen flex flex-col w-full">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between py-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger/>
              <NewConversationButton />
              <h1 className="text-xl font-semibold">Assist</h1>
            </div>
            <ClerkHeader />
          </div>
        </header>
        <main className="flex-1">
          <ChatInterface />
        </main>
      </div>
    </SidebarProvider>
  )
}