"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, FileText, Maximize2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`);
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  const handleGoBack = () => {
    router.back();
  };

  const handleTakeQuiz = () => {
    router.push(`/quiz/${params.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Article not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex gap-2 items-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">{article.title}</CardTitle>
            <CardDescription>
              Created on {new Date(article.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="flex gap-2 items-center text-lg font-semibold">
                <BookOpen className="w-5 h-5" />
                Summary
              </h3>
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <p>{article.summary}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="flex gap-2 items-center text-lg font-semibold">
                  <FileText className="w-5 h-5" />
                  Full Article
                </h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex gap-2 items-center"
                    >
                      <Maximize2 className="w-4 h-4" />
                      View Full Article
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{article.title}</DialogTitle>
                      <DialogDescription>
                        Created on{" "}
                        {new Date(article.createdAt).toLocaleDateString()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-w-none prose">
                      <p className="whitespace-pre-wrap">{article.content}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <p className="line-clamp-4">{article.content}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleGoBack}>
              Back to Articles
            </Button>
            <Button onClick={handleTakeQuiz}>Take Quiz</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
