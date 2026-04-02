"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  RefreshCw,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  articleId: string;
  question: string;
  options: string[];
  answer: string;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  quizzes: Question[];
}

interface UserScore {
  id: string;
  userId: string;
  score: number;
  createdAt: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousScores, setPreviousScores] = useState<UserScore[]>([]);
  const [showPreviousScores, setShowPreviousScores] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const articleResponse = await fetch(`/api/articles/${params.id}`);

        if (!articleResponse.ok) {
          throw new Error("Failed to fetch article");
        }

        const articleData = await articleResponse.json();

        if (!articleData.quizzes || articleData.quizzes.length === 0) {
          const quizResponse = await fetch("/api/quiz-generate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: articleData.content }),
          });

          if (!quizResponse.ok) {
            const errorText = await quizResponse.text();
            throw new Error(errorText || "Failed to generate quiz");
          }

          const quizData = await quizResponse.json();

          if (!quizData.quizzes || !Array.isArray(quizData.quizzes)) {
            throw new Error("Generated quiz data is invalid");
          }

          const saveResponse = await fetch(
            `/api/articles/${params.id}/quizzes`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ quizzes: quizData.quizzes }),
            },
          );

          if (!saveResponse.ok) {
            const errorText = await saveResponse.text();
            throw new Error(errorText || "Failed to save quiz");
          }

          const updatedResponse = await fetch(`/api/articles/${params.id}`);

          if (!updatedResponse.ok) {
            throw new Error("Failed to fetch updated article");
          }

          const updatedData = await updatedResponse.json();
          setArticle(updatedData);
        } else {
          setArticle(articleData);
        }
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  useEffect(() => {
    const fetchPreviousScores = async () => {
      if (!article) return;

      try {
        const response = await fetch(`/api/scores?articleId=${article.id}`);

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setPreviousScores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching previous scores:", err);
      }
    };

    fetchPreviousScores();
  }, [article]);

  useEffect(() => {
    if (article && !showResults) {
      setStartTime(Date.now());
    }
  }, [article, showResults]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getTimeSpent = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateScore = () => {
    if (!article || !article.quizzes || article.quizzes.length === 0) return;

    let correctAnswers = 0;

    article.quizzes.forEach((question) => {
      if (selectedAnswers[question.id] === Number(question.answer)) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round(
      (correctAnswers / article.quizzes.length) * 100,
    );

    setScore(finalScore);
  };

  const handleNextQuestion = () => {
    if (!article || !article.quizzes || article.quizzes.length === 0) return;

    if (currentQuestionIndex < article.quizzes.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    calculateScore();
    setShowResults(true);
  };

  const handleSubmitScore = async () => {
    if (
      !article ||
      !article.quizzes ||
      article.quizzes.length === 0 ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const timeSpent = getTimeSpent();

      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId: article.id,
          score,
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save score");
      }

      const scoresResponse = await fetch(`/api/scores?articleId=${article.id}`);

      if (scoresResponse.ok) {
        const data = await scoresResponse.json();
        setPreviousScores(Array.isArray(data) ? data : []);
      }

      toast.success("Score saved successfully!");
      setShowPreviousScores(true);
    } catch (err) {
      console.error("Error saving score:", err);
      toast.error("Failed to save score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setShowResults(false);
    setShowPreviousScores(false);
    setStartTime(Date.now());
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const togglePreviousScores = () => {
    setShowPreviousScores((prev) => !prev);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading quiz...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error || "Article not found"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGoHome} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!article.quizzes || article.quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">No Quiz Available</CardTitle>
            <CardDescription>
              This article doesn&apos;t have a quiz yet.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleGoHome} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = article.quizzes[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / article.quizzes.length) * 100;
  const isLastQuestion = currentQuestionIndex === article.quizzes.length - 1;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{article.title}</CardTitle>
            <CardDescription>
              {showResults
                ? "Quiz completed!"
                : `Question ${currentQuestionIndex + 1} of ${article.quizzes.length}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Progress value={progress} className="h-2" />

            {!showResults ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {currentQuestion.question}
                  </h3>

                  <RadioGroup
                    value={
                      selectedAnswers[currentQuestion.id] !== undefined
                        ? String(selectedAnswers[currentQuestion.id])
                        : undefined
                    }
                    onValueChange={(value) =>
                      handleAnswerSelect(currentQuestion.id, Number(value))
                    }
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 space-x-2 border rounded-lg"
                      >
                        <RadioGroupItem
                          value={String(index)}
                          id={`${currentQuestion.id}-${index}`}
                        />
                        <Label
                          htmlFor={`${currentQuestion.id}-${index}`}
                          className="w-full cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestion.id] === undefined}
                  >
                    {isLastQuestion ? "Finish Quiz" : "Next Question"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {!showPreviousScores ? (
                  <>
                    <div className="space-y-4 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                        <TrendingUp className="w-10 h-10" />
                      </div>

                      <div>
                        <h2 className="text-3xl font-bold">Quiz Completed!</h2>
                        <p className="mt-2 text-muted-foreground">
                          Your score: {score}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {article.quizzes.map((question, index) => {
                        const selected = selectedAnswers[question.id];
                        const correct = Number(question.answer);
                        const isCorrect = selected === correct;

                        return (
                          <div
                            key={question.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex items-start gap-3">
                              {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 mt-1 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 mt-1 text-red-500" />
                              )}

                              <div className="space-y-1">
                                <p className="font-medium">
                                  Question {index + 1}: {question.question}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Your answer:{" "}
                                  {selected !== undefined
                                    ? question.options[selected]
                                    : "Not answered"}
                                </p>
                                <p className="text-sm text-green-600">
                                  Correct answer: {question.options[correct]}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      <Button variant="outline" onClick={handleRestartQuiz}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restart Quiz
                      </Button>

                      <Button
                        variant="outline"
                        onClick={togglePreviousScores}
                        disabled={previousScores.length === 0}
                      >
                        View History
                      </Button>

                      <Button
                        onClick={handleSubmitScore}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save Score"}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        Your Quiz History
                      </h3>
                      <Button variant="outline" onClick={togglePreviousScores}>
                        Back to Results
                      </Button>
                    </div>

                    {previousScores.length > 0 ? (
                      <div className="space-y-4">
                        {previousScores.map((attempt, index) => (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                Attempt {previousScores.length - index}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(attempt.createdAt)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xl font-bold">
                                {attempt.score}%
                              </p>

                              {index > 0 && (
                                <p
                                  className={`text-sm ${
                                    attempt.score >
                                    previousScores[index - 1].score
                                      ? "text-green-500"
                                      : attempt.score <
                                          previousScores[index - 1].score
                                        ? "text-red-500"
                                        : "text-gray-500"
                                  }`}
                                >
                                  {attempt.score >
                                  previousScores[index - 1].score
                                    ? "↑ Improved"
                                    : attempt.score <
                                        previousScores[index - 1].score
                                      ? "↓ Decreased"
                                      : "→ Same"}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p>No previous scores found.</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-4 mt-6">
                      <Button variant="outline" onClick={handleRestartQuiz}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Take Quiz Again
                      </Button>

                      <Button onClick={handleGoHome}>
                        <Home className="w-4 h-4 mr-2" />
                        Go to Home
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
