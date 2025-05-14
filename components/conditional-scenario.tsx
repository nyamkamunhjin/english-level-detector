import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Option } from "@/lib/tools";

interface ConditionalScenarioProps {
  scenario: string;
  question: string;
  options: Option[];
  questionId: string;
  onSelect: (questionId: string, optionId: string) => void;
}

export function ConditionalScenario({ 
  scenario, 
  question,
  options, 
  questionId, 
  onSelect 
}: ConditionalScenarioProps) {
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
        <CardTitle className="text-lg">Conditional Scenario</CardTitle>
        <CardDescription>Read the scenario and respond appropriately</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/70 p-3 rounded-md border-l-4 border-blue-500">
            <p className="italic">{scenario}</p>
          </div>
          
          <div className="font-medium mt-2">{question}</div>
          
          <RadioGroup value={selectedOption || ""} onValueChange={handleSelect} className="mt-3">
            {options.map((option) => (
              <div key={option.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted">
                <RadioGroupItem value={option.id} id={`option-${option.id}`} className="mt-1" />
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