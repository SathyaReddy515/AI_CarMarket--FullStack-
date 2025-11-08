"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-b from-white to-gray-50"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ rotate: -20, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 8, delay: 0.2 }}
        className="mb-6"
      >
        <Search className="w-16 h-16 text-gray-700 animate-pulse" />
      </motion.div>

      {/* Big 404 */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="text-7xl font-extrabold text-gray-900 mb-4"
      >
        404
      </motion.h1>

      {/* Subheading */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4"
      >
        Page Not Found
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-gray-600 max-w-md mb-8"
      >
        Sorry, the page you’re looking for doesn’t exist or might have been
        moved. Please check the URL or go back to the homepage.
      </motion.p>

      {/* Button */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Link href="/" passHref>
          <Button size="lg" className="rounded-xl shadow-md hover:shadow-lg transition">
            Return Home
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
