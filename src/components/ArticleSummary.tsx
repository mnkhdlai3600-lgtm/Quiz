"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface ArticleSummaryProps {
  articleId: string;
  summary: string;
}

export default function ArticleSummary({
  articleId,
  summary,
}: ArticleSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useUser();

  const handleGenerateQuiz = async () => {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/articles/${articleId}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ generate: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to generate quiz");
      }

      await response.json();
      toast.success("Quiz generated successfully!");
      router.push(`/quiz/${articleId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <p className="whitespace-pre-line">{summary}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateQuiz} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            "Generate Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
