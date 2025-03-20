"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { ImLeaf } from "react-icons/im";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex justify-center items-center"><ImLeaf />
          </div>
          <a href="/"><span className="text-xl font-bold">MindEase</span></a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
            How It Works
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
            Testimonials
          </Link>
          <Link href="#faq" className="text-sm font-medium hover:text-primary">
            FAQ
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
        <a href="/login "><Button variant="outline" className="w-full">Log In</Button></a>
              <a href="/signup"><Button className="w-full">Get Started</Button></a>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container py-4 bg-background">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="#features" 
              className="text-sm font-medium hover:text-primary"
              onClick={toggleMenu}
            >
              Features
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-sm font-medium hover:text-primary"
              onClick={toggleMenu}
            >
              How It Works
            </Link>
            <Link 
              href="#testimonials" 
              className="text-sm font-medium hover:text-primary"
              onClick={toggleMenu}
            >
              Testimonials
            </Link>
            <Link 
              href="#faq" 
              className="text-sm font-medium hover:text-primary"
              onClick={toggleMenu}
            >
              FAQ
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <a href="/login "><Button variant="outline" className="w-full">Log In</Button></a>
              <a href="/signup"><Button className="w-full">Get Started</Button></a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
