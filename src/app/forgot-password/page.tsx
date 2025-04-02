'use client'

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from 'sonner';
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.status === 404) {
        setError("Email does not exist. Please check and try again.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to send reset link");
      }

      toast.success("Password reset link sent to your email",{duration:5000});
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.");
      setError("Failed to send reset link. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">

        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-primary">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            We'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 mb-5"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
              >
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-indigo-600" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground font-medium">
              Remember your password?{" "}
              <Link href="/login" className="text-indigo-600 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      <Toaster richColors position='top-center' />
    </div>
  );
}