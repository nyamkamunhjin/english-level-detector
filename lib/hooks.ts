import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Assessment, ChatMessage } from "@/lib/types";

interface UseEnglishLevelDetectorReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isAssessmentComplete: boolean;
  assessment: Assessment | null;
  handleSubmit: (message: string) => void;
  restart: () => void;
}

export function useEnglishLevelDetector(): UseEnglishLevelDetectorReturn {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setQuestionCount] = useState(0);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Initialize the chat with a welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content: "Welcome to the English Level Assessment! I'll ask you a series of questions to determine your English proficiency level. Let's start! What's your name?",
        },
      ]);
    }
  }, [chatMessages.length]);

  const handleSubmit = useCallback(
    async (message: string) => {
      if (message.trim() === "" || isLoading) return;

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: message,
      };

      setChatMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Create a new AbortController
      const controller = new AbortController();
      setAbortController(controller);

      try {
        // Prepare the messages to send to the API
        const messagesToSend = chatMessages
          .filter((m) => m.id !== "thinking")
          .concat(userMessage)
          .map(({ role, content }) => ({ role, content }));

        // Add thinking indicator
        setChatMessages((prev) => [
          ...prev,
          {
            id: "thinking",
            role: "assistant",
            content: "Thinking...",
          },
        ]);

        // Call the API with streaming
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: messagesToSend }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Process the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = decoder.decode(value, { stream: true });
          responseText += text;
          
          // Check if this is an assessment result
          if (responseText.includes("ASSESSMENT_RESULT:")) {
            // Don't update the UI with this partial content yet
            continue;
          }

          // Update the message in real-time
          setChatMessages((prev) => [
            ...prev.filter((m) => m.id !== "thinking"),
            {
              id: "streaming",
              role: "assistant",
              content: responseText,
            },
          ]);
        }

        // After streaming is complete, check if there's an assessment result
        if (responseText.includes("ASSESSMENT_RESULT:")) {
          try {
            const parts = responseText.split("ASSESSMENT_RESULT:");
            const displayContent = parts[0].trim();
            const jsonStr = parts[1].trim();
            const result = JSON.parse(jsonStr) as Assessment;
            
            setAssessment(result);
            setIsAssessmentComplete(true);
            
            // Update the final message
            setChatMessages((prev) => [
              ...prev.filter((m) => m.id !== "thinking" && m.id !== "streaming"),
              {
                id: uuidv4(),
                role: "assistant",
                content: displayContent,
              },
            ]);
          } catch (error) {
            console.error("Error processing assessment result:", error);
            // If there's an error parsing the result, just show the full message
            setChatMessages((prev) => [
              ...prev.filter((m) => m.id !== "thinking" && m.id !== "streaming"),
              {
                id: uuidv4(),
                role: "assistant",
                content: responseText,
              },
            ]);
          }
        } else {
          // Update with the final message
          setChatMessages((prev) => [
            ...prev.filter((m) => m.id !== "thinking" && m.id !== "streaming"),
            {
              id: uuidv4(),
              role: "assistant",
              content: responseText,
            },
          ]);
          
          // Increment question count if this looks like a question
          if (responseText.includes("?") && !isAssessmentComplete) {
            setQuestionCount((prev) => prev + 1);
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error fetching from API:", error);
          // Show error message
          setChatMessages((prev) => [
            ...prev.filter((m) => m.id !== "thinking" && m.id !== "streaming"),
            {
              id: uuidv4(),
              role: "assistant",
              content: "Sorry, I encountered an error. Please try again.",
            },
          ]);
        }
      } finally {
        setIsLoading(false);
        setAbortController(null);
      }
    },
    [chatMessages, isLoading, isAssessmentComplete]
  );

  const restart = useCallback(() => {
    // Abort any ongoing request
    if (abortController) {
      abortController.abort();
    }
    
    setChatMessages([]);
    setAssessment(null);
    setIsAssessmentComplete(false);
    setQuestionCount(0);
    setIsLoading(false);
  }, [abortController]);

  return {
    messages: chatMessages,
    isLoading,
    isAssessmentComplete,
    assessment,
    handleSubmit,
    restart,
  };
} 