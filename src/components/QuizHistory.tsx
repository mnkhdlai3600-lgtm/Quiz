"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserScore {
  id: string;
  userId: string;
  score: number;
  createdAt: string;
}

interface QuizHistoryProps {
  scores: UserScore[];
  onRestart: () => void;
  onGoHome: () => void;
  onBackToResults: () => void;
}

export default function QuizHistory({
  scores,
  onRestart,
  onGoHome,
  onBackToResults,
}: QuizHistoryProps) {
  const router = useRouter();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Your Quiz History</h3>
        <Button variant="outline" onClick={onBackToResults}>
          Back to Results
        </Button>
      </div>

      {scores.length > 0 ? (
        <div className="space-y-4">
          {scores.map((score, index) => (
            <div
              key={score.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">Attempt {scores.length - index}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(score.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{score.score}%</p>
                {index > 0 && (
                  <p
                    className={`text-sm ${
                      score.score > scores[index - 1].score
                        ? "text-green-500"
                        : score.score < scores[index - 1].score
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {score.score > scores[index - 1].score
                      ? "↑ Improved"
                      : score.score < scores[index - 1].score
                      ? "↓ Decreased"
                      : "→ Same"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p>No previous scores found.</p>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={onRestart}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Take Quiz Again
        </Button>
        <Button onClick={onGoHome}>
          <Home className="h-4 w-4 mr-2" />
          Go to Home
        </Button>
      </div>
    </div>
  );
}
