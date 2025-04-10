"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast, Toaster } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

const LoginPage = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const router = useRouter()
    const { login, isLoggedIn } = useAuth();

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        console.log("Token:", token);
        if (!token && isLoggedIn === true) {
            localStorage.removeItem("isLoggedIn");
        }
    }, [isLoggedIn]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if(!email || !password){
                setIsLoading(false);
                return toast.error("Please enter email and password");
            }

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', 
              });
          

            const data = await response.json();
            
            if(!response.ok) {
                setIsLoading(false);
                if(data.error === "Invalid Password") {
                    return toast.error("Invalid password. Please try again.");
                }
                if(data.error === "User does not exist") {
                    return toast.error("User does not exist");
                }
                return toast.error(data.error || "Login failed");
            }

            // Update auth state through context
            login();
            toast.success("Login Successful");
            await delay(1000);
            router.push('/dashboard');
        } catch (error) {
            setIsLoading(false);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4 overflow-y-hidden">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Welcome Back to MindEase
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Sign in to continue your journey towards a calmer, healthier you.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                        </Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="you@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border-gray-300 focus:border-indigo-600 focus:ring-indigo-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border-gray-300 focus:border-indigo-600 focus:ring-indigo-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            'Sign in →'
                        )}
                    </button>

                    <div className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign up
                        </Link>
                    </div>
                </form>
                <Toaster richColors position="top-center" />
            </div>
        </div>
    );
}

export default LoginPage;