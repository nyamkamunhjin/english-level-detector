import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ErrorOption {
  id: string;
  position: number;
  text: string;
  label?: string;
}

interface ErrorIdentificationProps {
  sentence: string;
  options: ErrorOption[];
  questionId: string;
  onSelect: (questionId: string, optionId: string) => void;
}

export function ErrorIdentification({ 
  sentence, 
  options, 
  questionId, 
  onSelect 
}: ErrorIdentificationProps) {
  const [selectedError, setSelectedError] = useState<string | null>(null);
  
  // Split sentence into words
  const words = sentence.split(' ');
  
  const handleSelect = (optionId: string) => {
    setSelectedError(optionId === selectedError ? null : optionId);
  };
  
  const handleSubmit = () => {
    if (selectedError) {
      onSelect(questionId, selectedError);
    }
  };

  // Find option by position
  const getOptionAtPosition = (position: number) => {
    return options.find(opt => opt.position === position);
  };

  return (
    <Card className="w-full mb-4 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Error Identification</CardTitle>
        <CardDescription>Identify the error in the sentence by clicking on the word</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-md leading-7">
            {words.map((word, index) => {
              const option = getOptionAtPosition(index);
              const isSelectable = !!option;
              const isSelected = option && selectedError === option.id;
              
              return (
                <span
                  key={index}
                  className={`px-1 py-0.5 mx-0.5 rounded-md inline-block
                    ${isSelectable ? 'cursor-pointer hover:bg-primary/10' : ''}
                    ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                  `}
                  onClick={() => isSelectable && handleSelect(option.id)}
                >
                  {word}
                </span>
              );
            })}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {options.map((option) => (
              <Badge 
                key={option.id}
                variant={selectedError === option.id ? "default" : "outline"}
                className="cursor-pointer text-sm px-3 py-2"
                onClick={() => handleSelect(option.id)}
              >
                {option.label ? `${option.label}. ` : ''}{option.text}
              </Badge>
            ))}
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedError}
            className="w-full mt-4"
          >
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 