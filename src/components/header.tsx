"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ImLeaf } from "react-icons/im";
import { useAuth } from "@/app/context/AuthContext";
import {
  AlertOctagon,
  ArrowRight,
  BookOpen,
  FileText,
  HeartPulse,
  Home,
  MessageSquare,
  Music,
  Settings,
  ThumbsUp,
  Video,
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  if (isLoggedIn === null) return null;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-lg shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex justify-center items-center shadow-md">
              <ImLeaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">MindEase</span>
          </Link>
          {isLoggedIn && (
            <Link href="/dashboard">
              <Button variant="outline" className="ml-3 border-gray-300 text-gray-700 hover:bg-gray-50">
                Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        {!isLoggedIn && (
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              Testimonials
            </Link>
            <Link href="#faq" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
              FAQ
            </Link>
          </nav>
        )}

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Button
              variant="outline"
              onClick={logout}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              Log Out
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg border-t border-gray-200 z-50">
          <nav className="flex flex-col p-4 space-y-3">
            {!isLoggedIn && (
              <>
                <Link
                  href="#features"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                  onClick={toggleMenu}
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                  onClick={toggleMenu}
                >
                  How It Works
                </Link>
                <Link
                  href="#testimonials"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                  onClick={toggleMenu}
                >
                  Testimonials
                </Link>
                <Link
                  href="#faq"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                  onClick={toggleMenu}
                >
                  FAQ
                </Link>
              </>
            )}
            {isLoggedIn ? (
                      <div className="md:hidden left-0 w-full bg-white  border-gray-200 z-50">
                      <nav className="flex flex-col p-4 space-y-3 text-gray-700">
                        <Link href="/dashboard/chat" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-indigo-50 transition">
                          <MessageSquare className="h-5 w-5 text-indigo-600" />
                          <span>Chat with AI</span>
                        </Link>
                        <Link href="/dashboard/resources" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-indigo-50 transition">
                          <HeartPulse className="h-5 w-5 text-indigo-600" />
                          <span>Resources</span>
                        </Link>
                        <Link href="/dashboard/playlist" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-indigo-50 transition">
                          <Music className="h-5 w-5 text-indigo-600" />
                          <span>Playlists</span>
                        </Link>
                        <Link href="/dashboard/feedback" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-indigo-50 transition">
                          <ThumbsUp className="h-5 w-5 text-indigo-600" />
                          <span>Feedback</span>
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-indigo-50 transition">
                          <Settings className="h-5 w-5 text-indigo-600" />
                          <span>Settings</span>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full mt-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            logout();
                            toggleMenu();
                          }}
                        >
                          Log Out
                        </Button>
                      </nav>
                    </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50" onClick={toggleMenu}>
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={toggleMenu}>
                    Get Started
                  </Button>
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