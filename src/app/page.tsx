"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ArticleForm from "@/components/ArticleForm";
import { toast } from "sonner";

interface Article {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
}

export default function Home() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [articleLoading, setArticleLoading] = useState(true);

  const [summary, setSummary] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch articles for sidebar
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/articles");
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setArticleLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!summary || !title) {
      toast.error("Please enter a title and generate a summary first");
      return;
    }

    setLoading(true);

    try {
      // Save article to database
      const saveResponse = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          summary,
          quizzes: [], // Will be generated on the quiz page
        }),
      });

      if (saveResponse.ok) {
        const result = await saveResponse.json();
        toast.success("Article saved successfully!");

        // Refresh articles list
        const response = await fetch("/api/articles");
        const data = await response.json();
        setArticles(data);

        // Reset form
        setTitle("");
        setContent("");
        setSummary(null);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save article");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!summary) return;
    setLoading(true);

    try {
      // Save article and quizzes to database
      const saveResponse = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title:
            title ||
            content.substring(0, 50) + (content.length > 50 ? "..." : ""),
          content,
          summary,
          quizzes: [], // Will be generated on the quiz page
        }),
      });

      if (saveResponse.ok) {
        const result = await saveResponse.json();
        router.push(`/quiz/${result.id}`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar articles={articles} loading={articleLoading} />
      <main className="flex-1 min-h-screen p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <ArticleForm
            title={title}
            content={content}
            summary={summary}
            loading={loading}
            onTitleChange={setTitle}
            onContentChange={setContent}
            onGenerateSummary={handleGenerateSummary}
            onSaveArticle={handleSaveArticle}
            onGenerateQuiz={handleGenerateQuiz}
          />
        </div>
      </main>
    </div>
  );
}
