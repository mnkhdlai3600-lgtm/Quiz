"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

interface QuizResultsProps {
  questions: Question[];
  selectedAnswers: { [key: string]: number };
  score: number;
  onRestart: () => void;
  onSaveScore: () => void;
  isSubmitting: boolean;
}

export default function QuizResults({
  questions,
  selectedAnswers,
  score,
  onRestart,
  onSaveScore,
  isSubmitting,
}: QuizResultsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
        <p className="text-lg">Your score: {score}%</p>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-2">
            <div className="flex items-start gap-2">
              {selectedAnswers[question.id] === question.answer ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-1" />
              )}
              <div>
                <p className="font-medium">
                  Question {index + 1}: {question.question}
                </p>
                <p className="text-sm text-gray-600">
                  Your answer:{" "}
                  {question.options[selectedAnswers[question.id] || 0]}
                </p>
                {selectedAnswers[question.id] !== question.answer && (
                  <p className="text-sm text-green-600">
                    Correct answer: {question.options[question.answer]}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onRestart}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Restart Quiz
        </Button>
        <Button onClick={onSaveScore} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Score"}
        </Button>
      </div>
    </div>
  );
}
