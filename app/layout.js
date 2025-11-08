// app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vehiql AI CarMarket",
  description: "Dream Car at your Fingertips",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header /> {/* Server component that passes props to client safely */}
          <main className="min-h-screen">{children}</main>
          <Toaster position="bottom-right" richColors />

          <footer className="w-full border-t flex items-center justify-center bg-blue-50 p-10">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Built with ❤️‍🔥 by Sathya #TheCoder</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
