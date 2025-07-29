'use client'

import React from 'react'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

interface ChatPanelProps {
  chatSession: any
  onClose: () => void
}

const ChatPanel: React.FC<ChatPanelProps> = ({ chatSession, onClose }) => {
  // Track component lifecycle
  React.useEffect(() => {
    const timestamp = new Date().toISOString()
    console.log(`📋 [${timestamp}] ChatPanel: Component MOUNTED`)

    return () => {
      const timestamp = new Date().toISOString()
      console.log(`📋 [${timestamp}] ChatPanel: Component UNMOUNTING`)
    }
  }, [])

  // Track re-renders
  React.useEffect(() => {
    const timestamp = new Date().toISOString()
    console.log(`📋 [${timestamp}] ChatPanel: Component RE-RENDERED`)
    console.log(`📋 [${timestamp}] ChatPanel: ChatSession state:`, {
      isOpen: chatSession.isOpen,
      sessionId: !!chatSession.sessionId,
      messagesCount: chatSession.messages.length,
      userLocation: chatSession.userLocation,
    })
  })

  return (
    <div className="w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[500px] md:w-96 md:h-[600px] md:max-h-none bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-slide-up">
      <ChatHeader
        onClose={onClose}
        onClear={chatSession.clearChat}
        chatSession={chatSession}
      />

      <ChatMessages
        messages={chatSession.messages}
        isTyping={chatSession.isTyping}
        messagesEndRef={chatSession.messagesEndRef}
      />

      {chatSession.error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-xs text-red-600 mt-1">
                {chatSession.error.details ||
                  chatSession.error.message ||
                  'Something went wrong. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <ChatInput
        onSendMessage={chatSession.sendMessage}
        onClear={chatSession.clearChat}
        isLoading={chatSession.isLoading}
        disabled={!!chatSession.error}
      />
    </div>
  )
}

export default ChatPanel
