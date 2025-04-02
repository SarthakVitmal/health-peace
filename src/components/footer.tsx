import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react"
import { ImLeaf } from "react-icons/im";

const Footer = () => {
  return (
    <footer className="border-t bg-white flex justify-center">
      <div className="container px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex justify-center items-center">
                <ImLeaf className="h-5 w-5" />
              </div>
              <span className="text-2xl font-bold text-gray-900">MindEase</span>
            </div>
            <p className="text-gray-600">
              AI-powered mental health support available 24/7 on web and mobile.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" aria-label="Facebook" className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Twitter" className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Instagram" className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="LinkedIn" className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Mental Health Tips
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Crisis Resources
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
            <p className="text-gray-600">
              Subscribe to our newsletter for the latest updates and resources.
            </p>
            <div className="flex gap-3">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="max-w-[220px] border-gray-300 focus:border-indigo-600 focus:ring-indigo-600" 
              />
              <Button 
                type="submit" 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-16 border-t border-gray-100 pt-8 text-center">
          <p className="text-gray-500">© {new Date().getFullYear()} MindEase. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/privacy-policy" className="text-gray-500 hover:text-indigo-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer