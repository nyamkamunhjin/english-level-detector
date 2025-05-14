import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Option } from "@/lib/tools";

interface ReadingComprehensionProps {
  passage: string;
  question: string;
  options: Option[];
  questionId: string;
  onSelect: (questionId: string, optionId: string) => void;
}

export function ReadingComprehension({ 
  passage, 
  question, 
  options, 
  questionId, 
  onSelect 
}: ReadingComprehensionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const handleSelect = (value: string) => {
    setSelectedOption(value);
  };
  
  const handleSubmit = () => {
    if (selectedOption) {
      onSelect(questionId, selectedOption);
    }
  };

  return (
    <Card className="w-full mb-4 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Reading Comprehension</CardTitle>
        <CardDescription>Read the passage and answer the question</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md text-sm max-h-60 overflow-y-auto">
            {passage.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-2">{paragraph}</p>
            ))}
          </div>
          
          <div className="font-medium mt-4">{question}</div>
          
          <RadioGroup value={selectedOption || ""} onValueChange={handleSelect} className="mt-3">
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                <Label htmlFor={`option-${option.id}`} className="flex cursor-pointer">
                  {option.label && (
                    <span className="font-bold mr-2">{option.label}.</span>
                  )}
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedOption}
            className="w-full mt-4"
          >
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 