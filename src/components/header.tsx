"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ImLeaf } from "react-icons/im";
import { useAuth } from "@/app/context/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  if (isLoggedIn === null) return null;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg shadow-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary text-white flex justify-center items-center shadow-lg">
              <ImLeaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-800">MindEase</span>
          </Link>
          {isLoggedIn && (
            <Link href="/dashboard">
              <Button variant="outline" className="ml-3">Dashboard</Button>
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        {!isLoggedIn && (
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Testimonials
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>
        )}

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="outline" onClick={logout} className="transition-all duration-200">
              Log Out
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="transition-all duration-200">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary text-white transition-all duration-200 hover:shadow-lg">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg border-t z-50">
          <nav className="flex flex-col p-4 space-y-4">
            {!isLoggedIn && (
              <>
                <Link href="#features" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                  How It Works
                </Link>
                <Link href="#testimonials" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                  Testimonials
                </Link>
                <Link href="#faq" className="text-sm font-medium hover:text-primary" onClick={toggleMenu}>
                  FAQ
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <Button variant="outline" className="w-full" onClick={logout}>
                Log Out
              </Button>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-primary text-white">Get Started</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
