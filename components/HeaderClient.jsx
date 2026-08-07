// components/HeaderClient.jsx
'use client';

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HeaderClient = ({ isAdminPage, isAdmin }) => {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <nav className="mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Vehiql Logo"
            width={200}
            height={50}
            className="h-12 w-auto object-contain"
          />
          {isAdminPage && <span className="text-xs font-extralight">Admin</span>}
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
          {isAdminPage ? (
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link href="/">
                <ArrowLeft size={20} />
                <span>Back to App</span>
              </Link>
            </Button>
          ) : (
            <>
              <SignedIn>
                <Button asChild>
                  <Link href="/saved-cars">
                    <Heart size={20} />
                    <span className="hidden md:inline">Saved Cars</span>
                  </Link>
                </Button>

                {!isAdmin ? (
                  <Button variant="outline" asChild>
                    <Link href="/reservations">
                      <CarFront size={20} />
                      <span className="hidden md:inline">My Reservations</span>
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href="/admin">
                      <Layout size={20} />
                      <span className="hidden md:inline">Admin Portal</span>
                    </Link>
                  </Button>
                )}
              </SignedIn>
            </>
          )}

          <SignedOut>
            <Button variant="outline" asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default HeaderClient;
