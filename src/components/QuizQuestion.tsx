"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

interface QuizQuestionProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  onAnswerSelect: (questionId: string, optionIndex: number) => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export default function QuizQuestion({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNextQuestion,
  isLastQuestion,
}: QuizQuestionProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{question.question}</h3>
        <RadioGroup
          value={selectedAnswer?.toString() || ""}
          onValueChange={(value) =>
            onAnswerSelect(question.id, parseInt(value))
          }
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onNextQuestion}
          disabled={selectedAnswer === undefined}
        >
          {isLastQuestion ? "Finish Quiz" : "Next Question"}
        </Button>
      </div>
    </>
  );
}
