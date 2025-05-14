import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type Option = {
  id: string;
  text: string;
  label: string;
};

type MultipleChoiceProps = {
  question: string;
  options: Option[];
  questionId: string;
  onSelect: (questionId: string, selectedOptionId: string) => void;
};

export const MultipleChoice = ({ 
  question, 
  options, 
  questionId,
  onSelect 
}: MultipleChoiceProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (optionId: string) => {
    if (!isSubmitted) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmit = () => {
    if (selectedOption && !isSubmitted) {
      setIsSubmitted(true);
      onSelect(questionId, selectedOption);
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium">{question}</h3>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption || ''}
          className="space-y-2"
          disabled={isSubmitted}
        >
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.id} 
                id={`${questionId}-${option.id}`}
                onClick={() => handleSelect(option.id)}
                disabled={isSubmitted}
              />
              <Label 
                htmlFor={`${questionId}-${option.id}`}
                className={`cursor-pointer ${isSubmitted && selectedOption === option.id ? 'font-bold' : ''}`}
              >
                {option.label}: {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <div className="mt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedOption || isSubmitted}
            size="sm"
          >
            {isSubmitted ? 'Submitted' : 'Submit Answer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 