import { cn } from "@/lib/utils";
import { ChatMessage } from "@/lib/types";
import { Message } from "@ai-sdk/react";
import LLMOutput from "./llm-output";

interface ChatMessageProps {
  message: ChatMessage | Message;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
}

export function ChatMessageComponent({ message, status = 'ready' }: ChatMessageProps) {
  // Handle options from custom ChatMessage type
  const hasOptions = 'options' in message && Array.isArray(message.options);
  const onOptionClick = 'onOptionClick' in message ? message.onOptionClick : undefined;
  
  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 py-4",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2",
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {message.role === "assistant" ? (
          <LLMOutput text={message.content as string} status={status} />
        ) : (
          message.content
        )}
        {hasOptions && (
          <div className="flex flex-col gap-2 pt-2">
            {(message as ChatMessage).options!.map((option, i) => (
              <button
                key={i}
                className="rounded border border-border px-3 py-1 text-sm hover:bg-muted-foreground/10"
                onClick={() => onOptionClick?.(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 