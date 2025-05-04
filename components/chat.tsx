'use client'
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessageComponent } from "@/components/chat-message";
import { Assessment } from "@/lib/types";
import { useChat } from "@ai-sdk/react";
import LLMOutput from "./llm-output";
import { ChevronDown } from "lucide-react";

export function Chat() {
  const [input, setInput] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const { 
    messages, 
    input: chatInput, 
    handleInputChange,
    handleSubmit: handleChatSubmit,
    status, 
    setMessages
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Welcome to the English Level Assessment! I'll ask you a series of questions to determine your English proficiency level. Let's start! What's your name?"
      }
    ]
  });

  // Check if the chat is currently loading
  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      handleChatSubmit(e);
      setInput("");
      
      // Focus the input after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      // Scroll to bottom when sending a message
      scrollToBottom();
    }
  };

  // Process messages to check for assessment results
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && typeof lastMessage.content === 'string' && lastMessage.content.includes("ASSESSMENT_RESULT:")) {
      try {
        // Extract assessment result JSON
        const parts = lastMessage.content.split("ASSESSMENT_RESULT:");
        const jsonStr = parts[1].trim();
        
        // Safely parse the multi-line JSON
        // Using a more robust JSON extraction approach
        const jsonRegex = /{[\s\S]*?}/;
        const match = jsonStr.match(jsonRegex);
        
        if (match) {
          const result = JSON.parse(match[0]) as Assessment;
          setAssessment(result);
          setIsAssessmentComplete(true);
        }
      } catch (error) {
        console.error("Error processing assessment result:", error);
      }
    }
  }, [messages]);

  // Focus input when status changes from loading to ready
  useEffect(() => {
    if (status === 'ready' && !isAssessmentComplete && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status, isAssessmentComplete]);

  const restart = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Welcome to the English Level Assessment! I'll ask you a series of questions to determine your English proficiency level. Let's start! What's your name?"
      }
    ]);
    setAssessment(null);
    setIsAssessmentComplete(false);
    
    // Focus input after restart
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Sync the input state with the useChat input
  useEffect(() => {
    setInput(chatInput);
  }, [chatInput]);

  // Mark initial load as complete after component mounts
  useEffect(() => {
    setInitialLoadComplete(true);
  }, []);

  // Handle new messages - only auto-scroll if we're at the bottom or it's a user message
  useEffect(() => {
    if (messages.length > 0 && initialLoadComplete) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user' || isNearBottom()) {
        scrollToBottom();
      }
    }
  }, [messages, initialLoadComplete]);

  // Handle streaming messages
  useEffect(() => {
    if (status === 'streaming' && isNearBottom()) {
      scrollToBottom();
    }
  }, [status]);

  // Scroll position detection
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom);
    }
  };

  // Check if scroll is near bottom
  const isNearBottom = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      return scrollHeight - scrollTop - clientHeight < 100;
    }
    return true;
  };

  // Scroll to bottom helper function
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setShowScrollButton(false);
    }
  };

  // Format assessment data for markdown rendering
  const formatAssessmentSection = (items: string[]) => {
    return items.map(item => `- ${item}`).join('\n');
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border shadow-sm overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-lg font-semibold">English Level Assessment</h2>
        {isAssessmentComplete && (
          <Button variant="ghost" size="sm" onClick={restart}>
            Start New Assessment
          </Button>
        )}
      </div>
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth relative"
        onScroll={handleScroll}
      >
        <div>
          {messages.map((message) => (
            <div key={message.id}>
              <ChatMessageComponent 
                message={{
                  id: message.id,
                  role: message.role,
                  content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
                }}
              />
            </div>
          ))}
        </div>
        
        {isAssessmentComplete && assessment && (
          <div 
            className="mt-4 rounded-lg border bg-background p-4 shadow-sm"
          >
            <h3 className="text-xl font-semibold">Your Assessment Results</h3>
            <div className="mt-2">
              <p className="text-lg">
                <span className="font-medium">English Level:</span>{" "}
                <span className="font-bold text-primary">{assessment.level}</span>
              </p>
              
              <div className="mt-4">
                <h4 className="font-medium">Strengths:</h4>
                <LLMOutput text={formatAssessmentSection(assessment.strengths)} />
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium">Areas for Improvement:</h4>
                <LLMOutput text={formatAssessmentSection(assessment.weaknesses)} />
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium">Recommendations:</h4>
                <LLMOutput text={formatAssessmentSection(assessment.recommendations)} />
              </div>
            </div>
          </div>
        )}
        
        {/* Floating scroll button */}
        {showScrollButton && (
          <button
            className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-2 rounded-full shadow-md hover:bg-primary/90 transition-opacity"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
          >
            <ChevronDown size={20} />
          </button>
        )}
      </div>
      
      <form 
        onSubmit={handleSubmit}
        className="border-t p-4"
      >
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleInputChange(e);
            }}
            placeholder={isLoading ? "Thinking..." : "Type your answer..."}
            disabled={isLoading || isAssessmentComplete}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={isLoading || isAssessmentComplete || !input.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
} 