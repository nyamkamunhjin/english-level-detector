import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, BookOpen, Star } from "lucide-react";
import { AssessmentResult } from "@/lib/tools";

interface AssessmentResultProps {
  result: AssessmentResult;
}

export function AssessmentResultComponent({ result }: AssessmentResultProps) {
  return (
    <Card className="w-full mb-4 shadow-sm">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          Assessment Complete
        </CardTitle>
        <CardDescription>
          Your English proficiency level has been evaluated
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="text-3xl font-bold text-primary mb-2">{result.level}</div>
            <p className="text-muted-foreground">CEFR Level</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {/* Strengths */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Strengths
              </h3>
              <ul className="space-y-1 text-sm">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="pl-4 border-l-2 border-green-400">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Areas for Improvement */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-1 text-sm">
                {result.weaknesses.map((weakness, index) => (
                  <li key={index} className="pl-4 border-l-2 border-blue-400">
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Recommendations
              </h3>
              <ul className="space-y-1 text-sm">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="pl-4 border-l-2 border-indigo-400">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 