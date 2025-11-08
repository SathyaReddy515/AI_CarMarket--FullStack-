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
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft size={20} />
                <span>Back to App</span>
              </Button>
            </Link>
          ) : (
            <>
              <SignedIn>
                <Link href="/saved-cars">
                  <Button>
                    <Heart size={20} />
                    <span className="hidden md:inline">Saved Cars</span>
                  </Button>
                </Link>

                {!isAdmin ? (
                  <Link href="/reservations">
                    <Button variant="outline">
                      <CarFront size={20} />
                      <span className="hidden md:inline">My Reservations</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/admin">
                    <Button variant="outline">
                      <Layout size={20} />
                      <span className="hidden md:inline">Admin Portal</span>
                    </Button>
                  </Link>
                )}
              </SignedIn>
            </>
          )}

          <SignedOut>
            <Link href="/sign-in">
              <Button variant="outline">Login</Button>
            </Link>
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
