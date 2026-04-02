"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
}

interface Article {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  createdAt: string;
  quizzes: Quiz[];
}

interface Quiz {
  id: string;
  question: string;
  option: string[];
  answer: string;
}

interface QuizAttempt {
  id: string;
  score: number;
  timeSpent: number;
  createdAt: string;
  quiz: {
    article: {
      title: string;
    };
  };
}

interface UserContextType {
  user: User | null;
  articles: Article[];
  quizHistory: QuizAttempt[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  articles: [],
  quizHistory: [],
  loading: true,
  refreshData: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/articles`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setQuizHistory(data.quizHistory || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (userId) {
        fetchUserData();
      } else {
        setLoading(false);
      }
    }
  }, [userId, isLoaded]);

  return (
    <UserContext.Provider
      value={{
        user,
        articles,
        quizHistory,
        loading: loading || !isLoaded,
        refreshData: fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
