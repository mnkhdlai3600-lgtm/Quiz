import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkLoaded,
  ClerkProvider,
  RedirectToSignIn,
  Show,
} from "@clerk/nextjs";
import Header from "@/components/Header";
import { UserProvider } from "@/contexts/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiz App",
  description: "Test your knowledge with our quiz app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en">
        <body className={inter.className}>
          <ClerkLoaded>
            <Show when="signed-in" fallback={<RedirectToSignIn />}>
              <UserProvider>
                <Header />
                <main className="mx-auto">{children}</main>
              </UserProvider>
            </Show>
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}
