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
import { useSession, signIn, signOut } from "next-auth/react";


const LoginPage = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if(!email || !password){
                return toast.error("Please enter email and password")
            }
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email,password})
            })

            const data = await response.json();
            
            if(!response.ok) {
                if(data.error === "Invalid Password") {
                    return toast.error("Invalid password. Please try again.");
                }
                if(data.error === "User does not exist") {
                    return toast.error("User does not exist");
                }
                return toast.error(data.error || "Login failed");
            }

            localStorage.setItem("isLoggedIn", "true"); 
            localStorage.setItem("token", data.token); 
            window.location.reload();
            toast.success("Login Successful")  
            await delay(3000);
            router.push('/dashboard');
        } catch (error) {
            toast.error("An unexpected error happened")
        }
    };

    return (
        <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Welcome Back to MindEase
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Sign in to continue your journey towards a calmer, healthier you.
            </p>

            <form className="my-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-black">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2 mt-3 mb-4">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

                <button
                    className="group/btn relative block h-10 w-full rounded-md bg-black font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:from-blue-600 dark:to-teal-600 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] cursor-pointer"
                    type="submit"
                >
                    Login &rarr;
                </button>

                {/* <button
                    className="group/btn relative block h-10 w-full mt-5 rounded-md bg-black font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:from-blue-600 dark:to-teal-600 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] cursor-pointer"
                    onClick={() => {
                        setEmail('');
                        setPassword('');
                        signIn('google');
                    }}
                    type="button"
                >
                    Continue with Google
                </button> */}

                <div className="mt-4 text-center">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-blue-500 hover:underline"
                    >
                        Forgot your password?
                    </Link>
                </div>
                {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md"
                >
                  <AlertCircle size={20} />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
                <p className="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </p>
            </form>
            <Toaster richColors position='top-center' />
        </div>
    );
}

export default LoginPage;