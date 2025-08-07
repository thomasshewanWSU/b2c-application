"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your admin assistant. I can help you search users and orders. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user is authenticated and has admin role
  const isAuthenticated = status === "authenticated" && session?.user?.role === "admin";
  const isLoading_auth = status === "loading";

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isAuthenticated) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setAuthError(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationId,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        // Handle authentication error
        setAuthError(true);
        const errorMessage: Message = {
          role: "assistant",
          content: "Your session has expired. Please log in again to continue using the chat.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(data.conversationId);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Login prompt component
  const LoginPrompt = () => (
    <div 
      style={{
        background: 'var(--component-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        padding: 'var(--space-xl)',
        textAlign: 'center',
        color: 'var(--text)',
      }}
    >
      <div 
        style={{
          background: 'var(--warning-light)',
          borderRadius: '50%',
          width: '64px',
          height: '64px',
          margin: '0 auto var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LockClosedIcon 
          style={{
            width: '32px',
            height: '32px',
            color: 'var(--warning)',
          }}
        />
      </div>
      
      <h3 
        style={{
          margin: '0 0 var(--space-md)',
          color: 'var(--text)',
          fontSize: '1.25rem',
          fontWeight: '600',
        }}
      >
        Authentication Required
      </h3>
      
      <p 
        style={{
          margin: '0 0 var(--space-lg)',
          color: 'var(--text-muted)',
          lineHeight: '1.5',
        }}
      >
        You must be logged in as an admin to use the AI assistant.
      </p>
      
      <button
        onClick={() => router.push("/login")}
        style={{
          background: 'var(--overlay)',
          color: 'var(--overlay-text)',
          border: 'none',
          borderRadius: 'var(--border-radius-md)',
          padding: '0.75rem 1.5rem',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'var(--overlay-dark)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'var(--overlay)';
        }}
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 50,
            borderRadius: '50%',
            background: 'var(--overlay)',
            padding: '0.75rem',
            border: 'none',
            color: 'var(--overlay-text)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
          }}
          title="AI Assistant"
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.background = 'var(--overlay-dark)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = 'var(--overlay)';
          }}
        >
          <ChatBubbleLeftRightIcon style={{ width: '1.5rem', height: '1.5rem' }} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 50,
            display: 'flex',
            height: '600px',
            width: '384px',
            flexDirection: 'column',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            background: 'var(--background)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Header */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: 'var(--border-radius-lg)',
              borderTopRightRadius: 'var(--border-radius-lg)',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--overlay)',
              padding: '1rem',
              color: 'var(--overlay-text)',
            }}
          >
            <h3 style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>
              AI Admin Assistant
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                borderRadius: 'var(--border-radius-sm)',
                padding: '0.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--overlay-text)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--overlay-dark)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <XMarkIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>

          {/* Content Area */}
          {isLoading_auth ? (
            <div 
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <div>Loading...</div>
            </div>
          ) : !isAuthenticated ? (
            <div style={{ flex: 1, padding: 'var(--space-lg)', display: 'flex', alignItems: 'center' }}>
              <LoginPrompt />
            </div>
          ) : (
            <>
              {/* Messages */}
              <div 
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        borderRadius: 'var(--border-radius-lg)',
                        padding: '0.75rem 1rem',
                        background: message.role === "user" 
                          ? 'var(--overlay)' 
                          : 'var(--component-bg)',
                        color: message.role === "user" 
                          ? 'var(--overlay-text)' 
                          : 'var(--text)',
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: '1.4' }}>
                        {message.content}
                      </div>
                      <div
                        style={{
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
                          color: message.role === "user"
                            ? 'rgba(255, 255, 255, 0.7)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div
                      style={{
                        borderRadius: 'var(--border-radius-lg)',
                        background: 'var(--component-bg)',
                        padding: '0.75rem 1rem',
                        color: 'var(--text)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div>Thinking...</div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <div 
                            style={{
                              height: '0.5rem',
                              width: '0.5rem',
                              borderRadius: '50%',
                              background: 'var(--text-muted)',
                              animation: 'bounce 1.4s infinite',
                            }}
                          />
                          <div 
                            style={{
                              height: '0.5rem',
                              width: '0.5rem',
                              borderRadius: '50%',
                              background: 'var(--text-muted)',
                              animation: 'bounce 1.4s infinite 0.1s',
                            }}
                          />
                          <div 
                            style={{
                              height: '0.5rem',
                              width: '0.5rem',
                              borderRadius: '50%',
                              background: 'var(--text-muted)',
                              animation: 'bounce 1.4s infinite 0.2s',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {authError && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div
                      style={{
                        borderRadius: 'var(--border-radius-lg)',
                        background: 'var(--error-light)',
                        border: '1px solid var(--error)',
                        padding: '0.75rem 1rem',
                        color: 'var(--error)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <ExclamationTriangleIcon style={{ width: '1rem', height: '1rem' }} />
                      <span style={{ fontSize: '0.875rem' }}>
                        Redirecting to login...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div 
                style={{
                  borderTop: '1px solid var(--border-color)',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about users or orders..."
                    style={{
                      flex: 1,
                      resize: 'none',
                      borderRadius: 'var(--border-radius-lg)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--background)',
                      color: 'var(--text)',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color var(--transition-fast)',
                    }}
                    rows={2}
                    disabled={isLoading}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--border-color-focus)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-color)';
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--border-radius-lg)',
                      background: inputMessage.trim() && !isLoading ? 'var(--overlay)' : 'var(--text-muted)',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      color: 'var(--overlay-text)',
                      cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseOver={(e) => {
                      if (inputMessage.trim() && !isLoading) {
                        e.currentTarget.style.background = 'var(--overlay-dark)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (inputMessage.trim() && !isLoading) {
                        e.currentTarget.style.background = 'var(--overlay)';
                      }
                    }}
                  >
                    <PaperAirplaneIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add bounce animation styles */}
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
