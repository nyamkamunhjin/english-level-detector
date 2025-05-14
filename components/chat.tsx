'use client'
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessageComponent } from "@/components/chat-message";
import { Assessment } from "@/lib/types";
import { AssessmentResult } from "@/lib/tools";
import { Message, useChat } from "@ai-sdk/react";
import LLMOutput from "./llm-output";
import { ChevronDown, Loader2, Wrench } from "lucide-react";
import { MultipleChoice } from "./multiple-choice";
import { ReadingComprehension } from "./reading-comprehension";
import { ErrorIdentification } from "./error-identification";
import { Paraphrasing } from "./paraphrasing";
import { IdiomaticExpression } from "./idiomatic-expression";
import { ConditionalScenario } from "./conditional-scenario";
import { AssessmentResultComponent } from "./assessment-result";
import { Progress } from "@/components/ui/progress";

// Extended message interface to include isHidden property
interface ExtendedMessage extends Message {
  isHidden?: boolean;
}

// Option interface for multiple choice questions
interface Option {
  id: string;
  text: string;
  label: string;
}

export function Chat() {
  const [input, setInput] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);
  const [isToolCalling, setIsToolCalling] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const totalQuestions = 10;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  const { 
    messages, 
    input: chatInput, 
    handleInputChange,
    handleSubmit: handleChatSubmit,
    status, 
    setMessages,
    append
  } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Англи хэлний түвшин тогтоох үнэлгээнд тавтай морил! Таны англи хэлний чадварын түвшинг тодорхойлохын тулд би танд хэд хэдэн асуулт тавих болно. Эхлээд таны нэр хэн бэ?"
      }
    ]
  });

  console.log(messages);

  // Check if the chat is currently loading
  const isLoading = status === 'streaming' || status === 'submitted';

  // Check for tool calls in messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // If the last message contains a tool call but no tool result yet
      const hasToolCall = findToolData(lastMessage).some(tool => tool.type === 'tool_call');
      const hasToolResult = findToolData(lastMessage).some(tool => tool.type === 'tool_result');
      
      setIsToolCalling(hasToolCall && !hasToolResult);
    }
  }, [messages]);

  // Update question count based on tool results
  useEffect(() => {
    // Collect all question IDs from tool results (except assessment results)
    const allQuestionIds = messages.flatMap(message => 
      findToolData(message)
        .filter(tool => 
          tool.type === 'tool_result' && 
          tool.toolType !== 'assessmentResult' &&
          tool.data.questionId
        )
        .map(tool => tool.data.questionId)
    );
    
    // Create a new Set with unique question IDs
    const uniqueQuestionIds = new Set(allQuestionIds);
    
    // Update state if we have new questions
    if (uniqueQuestionIds.size !== answeredQuestionIds.size) {
      setAnsweredQuestionIds(uniqueQuestionIds);
      setQuestionCount(uniqueQuestionIds.size);
    }
  }, [messages]);

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

  // Handle multiple choice selection
  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    // Auto submit the selected answer but don't show text
    append({
      role: 'user',
      content: `I choose option ${optionId}`,
      // Cast to any to allow the isHidden property
      isHidden: true
    } as any);
    
    // Scroll to bottom
    scrollToBottom();
  };

  // Process assessment result tool calls
  useEffect(() => {
    const assessmentTools = messages.flatMap(message => 
      findToolData(message).filter(tool => tool.toolType === 'assessmentResult' && tool.type === 'tool_result')
    );
    
    if (assessmentTools.length > 0) {
      const assessmentData = assessmentTools[assessmentTools.length - 1].data;
      setAssessment(assessmentData);
      setIsAssessmentComplete(true);
    }
  }, [messages]);

  // Legacy assessment result parsing (fallback)
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
        content: "Англи хэлний түвшин тогтоох үнэлгээнд тавтай морил! Таны англи хэлний чадварын түвшинг тодорхойлохын тулд би танд хэд хэдэн асуулт тавих болно. Эхлээд таны нэр хэн бэ?"
      }
    ]);
    setAssessment(null);
    setIsAssessmentComplete(false);
    setSelectedOptions({});
    
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

  // Get option text by ID from a question
  const getOptionTextById = (options: Option[], optionId: string) => {
    const option = options.find((opt: Option) => opt.id === optionId);
    return option ? option.text : optionId;
  };

  // Helper to find tool call data in message
  const findToolData = (message: Message) => {
    // Check for tool calls in different formats based on SDK version
    const toolData = [];
    
    // Find tool calls in the message content
    if (message.parts && Array.isArray(message.parts)) {
      for (const part of message.parts) {
        if (
          part.type === 'tool-invocation' && 
          part.toolInvocation &&
          ['multipleChoice', 'readingComprehension', 'errorIdentification', 
           'paraphrasingTask', 'idiomaticExpression', 'conditionalScenario',
           'assessmentResult'].includes(part.toolInvocation.toolName) && 
          part.toolInvocation?.args
        ) {
          // If it has a result, use that (completed tool call)
          if (part.toolInvocation.state === 'result' && part.toolInvocation.result) {
            toolData.push({
              type: 'tool_result',
              toolType: part.toolInvocation.toolName,
              data: part.toolInvocation.result
            });
          } else {
            // Otherwise it's a pending tool call
            toolData.push({
              type: 'tool_call',
              toolType: part.toolInvocation.toolName,
              data: part.toolInvocation.args
            });
          }
        }
      }
    }
    
    return toolData;
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border shadow-sm overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-lg font-semibold">Англи хэлний түвшинг тогтоох үнэлгээ</h2>
        {isAssessmentComplete && (
          <Button variant="ghost" size="sm" onClick={restart}>
            Шинээр эхлэх
          </Button>
        )}
      </div>
      
      {!isAssessmentComplete && questionCount > 0 && (
        <div className="px-4 py-2 border-b bg-muted/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium">
              Асуулт {questionCount}/{totalQuestions}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((questionCount / totalQuestions) * 100)}% дууссан
            </span>
          </div>
          <Progress 
            value={(questionCount / totalQuestions) * 100} 
            className="h-2" 
          />
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth relative"
        onScroll={handleScroll}
      >
        <div>
          {messages.map((message) => {
            // Skip hidden messages (user selections)
            if (message.role === 'user' && (message as any).isHidden) {
              return null;
            }
            
            return (
              <div key={message.id}>
                <ChatMessageComponent 
                  message={{
                    id: message.id,
                    role: message.role,
                    content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
                  }}
                />
                
                {/* Render UI for different tool types */}
                {findToolData(message).map((tool, idx) => {
                  if (tool.type === 'tool_result') {
                    const result = tool.data;
                    
                    // Handle assessment result
                    if (tool.toolType === 'assessmentResult') {
                      return (
                        <AssessmentResultComponent 
                          key={`${message.id}-assessment-${idx}`}
                          result={result}
                        />
                      );
                    }
                    
                    if (result) {
                      const isAnswered = selectedOptions[result.questionId];
                      
                      // Render appropriate component based on tool type
                      if (!isAnswered) {
                        switch(tool.toolType) {
                          case 'multipleChoice':
                            return (
                              <MultipleChoice 
                                key={`${message.id}-multiple-choice-${idx}`}
                                question={result.question}
                                options={result.options}
                                questionId={result.questionId}
                                onSelect={handleOptionSelect}
                              />
                            );
                          case 'readingComprehension':
                            return (
                              <ReadingComprehension 
                                key={`${message.id}-reading-comp-${idx}`}
                                passage={result.passage}
                                question={result.question}
                                options={result.options}
                                questionId={result.questionId}
                                onSelect={handleOptionSelect}
                              />
                            );
                          case 'errorIdentification':
                            return (
                              <ErrorIdentification 
                                key={`${message.id}-error-id-${idx}`}
                                sentence={result.sentence}
                                options={result.options}
                                questionId={result.questionId}
                                onSelect={handleOptionSelect}
                              />
                            );
                          case 'paraphrasingTask':
                            return (
                              <Paraphrasing 
                                key={`${message.id}-paraphrase-${idx}`}
                                sentence={result.sentence}
                                options={result.options}
                                questionId={result.questionId}
                                onSelect={handleOptionSelect}
                              />
                            );
                          case 'idiomaticExpression':
                            return (
                              <IdiomaticExpression 
                                key={`${message.id}-idiomatic-${idx}`}
                                context={result.context}
                                expression={result.expression}
                                question={result.question}
                                options={result.options}
                                questionId={result.questionId}
                                onSelect={handleOptionSelect}
                              />
                            );
                          case 'conditionalScenario':
                            return (
                              <ConditionalScenario 
                                key={`${message.id}-conditional-${idx}`}
                                scenario={result.scenario}
                                question={result.question}
                                options={result.options}
                                questionId={result.questionId}
                                onSelect={handleOptionSelect}
                              />
                            );
                          default:
                            return null;
                        }
                      } else {
                        // Show answered question UI
                        return (
                          <div key={`${message.id}-answered-${idx}`} className="w-full p-4 rounded-md border border-gray-200 bg-gray-50 my-4">
                            {tool.toolType === 'readingComprehension' && (
                              <div className="mb-3 text-sm bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                                <p className="font-medium text-xs text-gray-500 mb-1">Passage</p>
                                {result.passage}
                              </div>
                            )}
                            
                            {tool.toolType === 'errorIdentification' && (
                              <div className="mb-3">
                                <p className="font-medium mb-1">{result.sentence}</p>
                              </div>
                            )}
                            
                            {tool.toolType === 'paraphrasingTask' && (
                              <div className="mb-3">
                                <p className="font-medium mb-1">Original: {result.sentence}</p>
                              </div>
                            )}
                            
                            {tool.toolType === 'idiomaticExpression' && (
                              <div className="mb-3">
                                <p className="text-sm mb-1">{result.context}</p>
                                <p className="font-medium text-primary mb-1">"{result.expression}"</p>
                                <p className="font-medium mt-2">{result.question}</p>
                              </div>
                            )}
                            
                            {tool.toolType === 'conditionalScenario' && (
                              <div className="mb-3">
                                <p className="italic mb-1">{result.scenario}</p>
                                <p className="font-medium mt-2">{result.question}</p>
                              </div>
                            )}
                            
                            {/* Show question for multiple choice */}
                            {(tool.toolType === 'multipleChoice') && (
                              <div className="mb-3">
                                <p className="font-medium">{result.question}</p>
                              </div>
                            )}
                            
                            <div className="flex gap-2 items-center">
                              <div className="bg-primary text-white px-2 py-1 rounded font-medium">
                                {result.options.find((opt: Option) => opt.id === selectedOptions[result.questionId])?.label || selectedOptions[result.questionId]}
                              </div>
                              <p>{getOptionTextById(result.options, selectedOptions[result.questionId])}</p>
                            </div>
                          </div>
                        );
                      }
                    }
                  } else if (tool.type === 'tool_call') {
                    return (
                      <div key={`${message.id}-call-${idx}`} className="w-full my-2 py-2 px-4 rounded-md border border-gray-200 animate-pulse">
                        <p className="text-gray-500">Loading question...</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>
        
        {/* Loading and Tool Calling indicators */}
        <div className="flex justify-center items-center gap-3 mt-2">
          {isLoading && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm text-gray-500">Бодож байна...</span>
            </div>
          )}
          
          {isToolCalling && (
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 animate-pulse text-blue-500" />
              <span className="text-sm text-blue-500">Асуултыг бэлдэж байна...</span>
            </div>
          )}
        </div>
        
        {/* Legacy Assessment Result Display */}
        {isAssessmentComplete && assessment && !findToolData(messages[messages.length - 1]).some(tool => tool.toolType === 'assessmentResult') && (
          <div 
            className="mt-4 rounded-lg border bg-background p-4 shadow-sm"
          >
            <h3 className="text-xl font-semibold">Таны үнэлгээ</h3>
            <div className="mt-2">
              <p className="text-lg">
                <span className="font-medium">Англи хэлний түвшин:</span>{" "}
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
                <h4 className="font-medium">Зөвлөгөө:</h4>
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