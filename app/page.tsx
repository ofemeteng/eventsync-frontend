'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Calendar, Zap, Users, Globe, Sparkles, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ThemeProvider, useTheme } from '@/components/theme-context'
import './chat-interface.css'

const renderMessageWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) =>
    urlRegex.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        {part}
      </a>
    ) : (
      part
    )
  );
};

function ChatInterface() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const appendMessage = (sender: string, text: string) => {
    // Remove any <tool_call> content from the message
    const filteredText = text.replace(/<tool_call>.*?<\/tool_call>/gs, '').trim();

    // Only append the message if there's content left after filtering
    if (filteredText) {
      setMessages((prevMessages) => [...prevMessages, { sender, text: filteredText }]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    appendMessage('user', inputMessage)
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      appendMessage('bot', data.response)
    } catch (error) {
      console.error('Error sending message:', error)
      appendMessage('bot', 'Sorry, there was an error processing your request.')
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 relative overflow-hidden ${theme === 'dark'
      ? 'bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-700'
      : 'bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200'
      }`}>
      <div className={`absolute inset-0 bg-confetti ${theme === 'dark' ? 'opacity-5' : 'opacity-10'}`}></div>
      <Card className={`w-full max-w-4xl backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden z-10 border-4 ${theme === 'dark'
        ? 'bg-indigo-950/90 border-indigo-700'
        : 'bg-white/90 border-indigo-300'
        }`}>
        <CardHeader className={`relative ${theme === 'dark'
          ? 'bg-gradient-to-r from-indigo-700 to-purple-700 text-white'
          : 'bg-gradient-to-r from-indigo-300 to-purple-300 text-indigo-900'
          } p-6`}>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={theme === 'dark' ? 'text-indigo-200 hover:text-white' : 'text-indigo-700 hover:text-indigo-900'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="animate-bounce">
              <Sparkles className={`h-6 w-6 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`} />
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-bold flex items-center justify-center">
            <Calendar className="mr-2 h-8 w-8" /> EventSync
          </CardTitle>
          <CardDescription className={`text-center mt-2 font-semibold ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'
            }`}>
            Your Fun & Professional Event Management Buddy!
          </CardDescription>
          <div className="flex justify-center mt-4 space-x-4">
            <div className={`flex items-center rounded-full px-3 py-1 ${theme === 'dark' ? 'bg-indigo-800/60' : 'bg-indigo-100 shadow-md'
              }`}>
              <Zap className={`h-5 w-5 mr-1 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-500'}`} />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'}`}>AI-Powered</span>
            </div>
            <div className={`flex items-center rounded-full px-3 py-1 ${theme === 'dark' ? 'bg-indigo-800/60' : 'bg-indigo-100 shadow-md'
              }`}>
              <Users className={`h-5 w-5 mr-1 ${theme === 'dark' ? 'text-green-300' : 'text-green-500'}`} />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'}`}>Collaborative</span>
            </div>
            <div className={`flex items-center rounded-full px-3 py-1 ${theme === 'dark' ? 'bg-indigo-800/60' : 'bg-indigo-100 shadow-md'
              }`}>
              <Globe className={`h-5 w-5 mr-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`} />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-700'}`}>Web3 Ready</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className={`rounded-2xl shadow-inner p-4 h-[400px] overflow-y-auto mb-4 relative border-2 ${theme === 'dark'
            ? 'bg-gradient-to-b from-indigo-900 to-indigo-950 border-indigo-700'
            : 'bg-gradient-to-b from-indigo-50 to-white border-indigo-200'
            }`}>
            {messages.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <Calendar className={`h-16 w-16 mb-4 animate-pulse ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  }`} />
                <p className={`text-lg font-medium ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-800'
                  }`}>Welcome to EventSync!</p>
                <p className={theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}>
                  Let's make your events awesome together! 🎉
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 ${message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                >
                  <span
                    className={`inline-block px-4 py-2 rounded-2xl shadow-sm max-w-[80%] ${message.sender === 'user'
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gradient-to-r from-indigo-800 to-purple-800 text-indigo-100'
                        : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900'
                      }`}
                  >
                    {renderMessageWithLinks(message.text)}
                  </span>
                </div>
              ))
            )}
            {isTyping && (
              <div className="text-left mb-3">
                <span className={`inline-block px-4 py-2 rounded-2xl shadow-sm ${theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-800 to-purple-800'
                  : 'bg-gradient-to-r from-indigo-100 to-purple-100'
                  }`}>
                  <span className="typing-indicator">
                    <span className={`dot ${theme === 'dark' ? 'bg-indigo-300' : 'bg-indigo-600'}`}></span>
                    <span className={`dot ${theme === 'dark' ? 'bg-indigo-300' : 'bg-indigo-600'}`}></span>
                    <span className={`dot ${theme === 'dark' ? 'bg-indigo-300' : 'bg-indigo-600'}`}></span>
                  </span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex space-x-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your fun event ideas here..."
              className={`flex-grow border-2 focus:ring focus:ring-opacity-50 rounded-xl resize-none shadow-sm transition-all duration-200 ${theme === 'dark'
                ? 'bg-indigo-900 border-indigo-700 focus:border-purple-500 focus:ring-purple-500 text-indigo-100 placeholder-indigo-400'
                : 'bg-white border-indigo-300 focus:border-purple-400 focus:ring-purple-400 text-indigo-900 placeholder-indigo-500'
                }`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <Button
              onClick={sendMessage}
              className={`self-end font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                }`}
            >
              <Send className="w-5 h-5 mr-2" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ThemedChatInterface() {
  return (
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  )
}

