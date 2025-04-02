"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast, Toaster } from "sonner"
import { CheckCircle, Star, Loader2, MessageSquare, Bug, Lightbulb, Smile } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

const FeedbackPage = () => {
    const [feedback, setFeedback] = useState("")
    const [email, setEmail] = useState("")
    const [rating, setRating] = useState(0)
    const [feedbackType, setFeedbackType] = useState("general")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [firstName, setFirstName] = useState("")
    const [userId, setUserId] = useState("")
    const router = useRouter();

    const feedbackTypes = [
        { value: "general", label: "General Feedback", icon: <MessageSquare className="h-4 w-4" /> },
        { value: "bug", label: "Bug Report", icon: <Bug className="h-4 w-4" /> },
        { value: "suggestion", label: "Feature Suggestion", icon: <Lightbulb className="h-4 w-4" /> },
        { value: "experience", label: "User Experience", icon: <Smile className="h-4 w-4" /> },
    ]

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/auth/user");
                const data = await response.json();

                if (response.ok) {
                    setFirstName(data.user.firstName);
                    setUserId(data.user._id);
                    setEmail(data.user.email);
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedbackType,
                    rating,
                    feedback,
                    userName: firstName, 
                    email,
                }),
            });

            const data = await response.json();

            if (response.status === 429) {
                toast.warning(data.error || "You can only submit one feedback per day");
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit feedback');
            }

            toast.success("Thank you! Your feedback has been submitted successfully.");

            setFeedback("");
            setRating(0);
            setFeedbackType("general");
        } catch (error) {
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <Card className="border shadow-md bg-white overflow-hidden">
                    <div className="h-2 bg-primary w-full"></div>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-semibold text-center text-primary">Share Your Feedback</CardTitle>
                        <p className="text-center text-muted-foreground mt-2 text-sm">
                            We value your thoughts and suggestions to improve MindEase
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="feedbackType" className="text-sm font-medium">
                                    Feedback Type
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {feedbackTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFeedbackType(type.value)}
                                            className={`flex items-center gap-2 p-3 rounded-md border transition-all ${feedbackType === type.value
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-border hover:border-primary/30 hover:bg-primary/5"
                                                }`}
                                        >
                                            {type.icon}
                                            <span className="text-sm">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="rating" className="text-sm font-medium">
                                    How would you rate your experience?
                                </Label>
                                <div className="flex items-center space-x-1 bg-slate-50 p-3 rounded-md">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-7 w-7 transition-colors ${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="feedback" className="text-sm font-medium">
                                        Your Feedback
                                    </Label>
                                    <span className="text-xs text-red-500">*Required</span>
                                </div>
                                <Textarea
                                    id="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Share your thoughts, suggestions, or report any issues..."
                                    className="min-h-[120px] resize-none focus:ring-primary"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md pointer-events-none opacity-70">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium">
                                        Name <span className="text-xs text-muted-foreground"></span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Your name"
                                        className="bg-white"
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email <span className="text-xs text-muted-foreground"></span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="bg-white"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full py-6 text-base font-medium transition-all hover:shadow-md cursor-pointer"
                                    disabled={isSubmitting || !feedback.trim()}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Feedback"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col items-center text-center text-sm text-muted-foreground bg-slate-50 py-4 mt-6">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <p className="font-medium text-slate-700">Your feedback helps us improve MindEase</p>
                        </div>
                        <p className="text-xs">We appreciate you taking the time to share your thoughts!</p>
                    </CardFooter>
                </Card>
            </div>
            <Toaster richColors position='top-center' />
        </div>
    )
}

export default FeedbackPage

