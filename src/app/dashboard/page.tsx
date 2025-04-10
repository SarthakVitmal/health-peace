"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
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
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "sonner";

// Components
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Loader from "@/components/loader";
import { useAuth } from "@/app/context/AuthContext";

// Types
interface MoodData {
  [date: string]: string;
}

interface DailyQuote {
  q: string;
  a: string;
}

interface Resource {
  title: string;
  type: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
}

interface QuickAction {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  variant?: "destructive";
}

// Static Data
const RESOURCES: Resource[] = [
  {
    title: "Understanding Anxiety",
    type: "Article",
    icon: FileText,
    description: "Learn about the causes and symptoms of anxiety disorders.",
    href: `https://studyfinds.org/americans-worry-time-anxiety/`,
  },
  {
    title: "Mindfulness Meditation",
    type: "Video",
    icon: Video,
    description: "A 10-minute guided meditation for stress relief.",
    href: "https://youtu.be/kQ89ttuCNlI?si=cHjTPCeTHWVU_l-9",
  },
  {
    title: "Cognitive Behavioral Therapy",
    type: "Guide",
    icon: BookOpen,
    description: "An introduction to CBT techniques for managing negative thoughts.",
    href: "/dashboard/resources",
  },
];

const ACTIONS: QuickAction[] = [
  {
    title: "Chat with AI",
    icon: MessageSquare,
    href: "/dashboard/chat",
    color: "text-blue-600",
  },
  {
    title: "Resources",
    icon: HeartPulse,
    href: "/dashboard/resources",
    color: "text-indigo-600",
  },
  {
    title: "Playlists",
    icon: Music,
    href: "/dashboard/playlist",
    color: "text-amber-600",
  },
  {
    title: "Feedback",
    icon: ThumbsUp,
    href: "/dashboard/feedback",
    color: "text-amber-600",
  },
  {
    title: "Emergency",
    icon: AlertOctagon,
    href: "/dashboard/emergency-assistance",
    color: "text-red-600",
    variant: "destructive",
  },
];

const MENU_ITEMS = [
  { title: "Dashboard", icon: Home, href: "/" },
  { title: "Chat with AI", icon: MessageSquare, href: "/dashboard/chat" },
  { title: "Resources", icon: HeartPulse, href: "/dashboard/resources" },
  { title: "Playlists", icon: Music, href: "dashboard/playlist" },
  { title: "Feedback", icon: ThumbsUp, href: "/dashboard/feedback" },
  { title: "Settings", icon: Settings, href: "dashboard/settings" },
];

// Fallback quotes for when API fails
const FALLBACK_QUOTES = [
  {
    q: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    a: "A.A. Milne"
  },
  {
    q: "Mental health is not a destination, but a process.",
    a: "Noam Shpancer"
  }
];

export default function MentalEaseDashboard() {
  const [firstName, setFirstName] = useState("");
  const [userId, setUserId] = useState("");
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [moodData, setMoodData] = useState<MoodData>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const router = useRouter();
  const { data: session } = useSession();
  const { isLoggedIn, checkAuthStatus } = useAuth();

  useEffect(() => {
    const validateAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      console.log(isAuthenticated)
      if (!isAuthenticated) {
        router.replace("/");
      }
    };
    
    validateAuth();
  }, [checkAuthStatus, router]);

  const handleSubmit = async () => {
    await fetch('/api/auth/logout');
    if (isLoggedIn === true) {
      localStorage.removeItem("isLoggedIn");
    }
    toast.success("Please login again");
    router.replace("/login");
  }

  // Memoized mood summary calculations
  const { moodSummary, totalMoods } = useMemo(() => {
    const summary = { happy: 0, neutral: 0, sad: 0 };
    Object.values(moodData).forEach(mood => {
      if (mood in summary) summary[mood as keyof typeof summary]++;
    });
    return {
      moodSummary: summary,
      totalMoods: Object.values(summary).reduce((sum, count) => sum + count, 0)
    };
  }, [moodData]);

  // Improved fetch user data with retry logic
  const fetchUserData = useCallback(async (retry = false) => {
    if (retry) {
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);
    }

    try {
      const response = await fetch("/api/auth/user", {
        cache: "no-store",
        // Add a cache-busting parameter
        headers: {
          'x-cache-buster': Date.now().toString()
        }
      });

      if (!response.ok) {
        // Only throw error if we've already retried multiple times or it's a 401
        if (response.status === 401 || retryCount >= 2) {
          throw new Error("Failed to fetch user data");
        }

        // Instead of throwing, retry once automatically
        if (!retry && !isRetrying) {
          setTimeout(() => fetchUserData(true), 1500);
          return;
        }
      }

      const data = await response.json();
      setFirstName(data.user.firstName);
      setUserId(data.user._id);
      setError(""); // Clear any existing errors
      await checkMoodStatus(data.user._id);
    } catch (err) {
      setError(session ? "Failed to fetch user data" : "Unable to load dashboard data");
      // Only redirect to login if we've tried multiple times
      if (retryCount >= 2 && !session) {
        setTimeout(() => router.replace("/login"), 2000);
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [router, session, retryCount, isRetrying]);

  // Fetch mood data with improved error handling
  const fetchMoodData = useCallback(async () => {
    if (!userId) return;

    try {
      const month = format(selectedMonth, "yyyy-MM");
      const response = await fetch(`/api/mood?userId=${userId}&month=${month}`, {
        next: { revalidate: 3600 } // Revalidate every hour
      });

      if (!response.ok) {
        // Instead of throwing, just log the error and continue
        console.error("Mood data fetch failed, will use empty data");
        return;
      }

      const data = await response.json();
      const formattedData = data.moods.reduce((acc: MoodData, mood: { date: string; mood: string }) => {
        acc[format(new Date(mood.date), "yyyy-MM-dd")] = mood.mood;
        return acc;
      }, {});
      setMoodData(formattedData);
    } catch (err) {
      console.error("Error fetching mood data:", err);
      // Don't set error state, just log it - allows the rest of the UI to load
    }
  }, [userId, selectedMonth]);

  // Check if mood has been recorded today
  const checkMoodStatus = useCallback(async (userId: string) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const response = await fetch(`/api/mood?userId=${userId}&date=${today}`);

      if (response.ok) {
        const data = await response.json();
        if (!data.mood) setIsMoodModalOpen(true);
      }
    } catch (err) {
      console.error("Error checking mood status:", err);
      // Non-fatal error, just log it
    }
  }, []);

  // Handle mood selection
  const handleMoodSelection = useCallback(async (mood: string) => {
    setIsMoodModalOpen(false);

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mood, today }),
      });

      if (!response.ok) throw new Error("Failed to save mood");

      await fetchMoodData();
      toast.success("Mood recorded successfully!");
    } catch (err) {
      toast.error("Failed to record mood");
    }
  }, [userId, fetchMoodData]);

  // Fetch daily quote with robust error handling
  const fetchDailyQuote = useCallback(async () => {
    try {
      // First try local storage cache to prevent flickering
      const cachedQuote = localStorage.getItem('dailyQuote');
      const cachedTimestamp = localStorage.getItem('dailyQuoteTimestamp');

      if (cachedQuote && cachedTimestamp) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (parseInt(cachedTimestamp) > oneDayAgo) {
          setDailyQuote(JSON.parse(cachedQuote));
          return;
        }
      }

      // If no cache or expired, fetch new quote
      const response = await fetch('/api/quotes');

      if (!response.ok) {
        throw new Error("Failed to fetch quote");
      }

      const result = await response.json();

      localStorage.setItem('dailyQuote', JSON.stringify(result));
      localStorage.setItem('dailyQuoteTimestamp', Date.now().toString());
      setDailyQuote(result);
    } catch (err) {
      console.error("Error fetching quote:", err);
      // Fallback to predefined quotes
      setDailyQuote(FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]);
    }
  }, []);

  // Manual retry handler
  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError("");
    fetchUserData(true);
    fetchDailyQuote();
  }, [fetchUserData, fetchDailyQuote]);

  // Initial data loading
  useEffect(() => {
    // Initialize data fetching with a slight delay to allow for auth to complete
    const timer = setTimeout(() => {
      fetchUserData();
      fetchDailyQuote();
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchUserData, fetchDailyQuote]);

  // Fetch mood data when month or userId changes
  useEffect(() => {
    if (userId) fetchMoodData();
  }, [userId, selectedMonth, fetchMoodData]);

  if (isLoading) return <Loader />;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
      <div className="max-w-md text-center space-y-6">
        <AlertOctagon className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
        <p className="text-gray-600">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="border-gray-300 flex items-center gap-2"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-gray-50 to-white font-sans">
        {/* Sidebar */}
        <Sidebar className="bg-white border-r border-gray-100 shadow-sm">
          <SidebarHeader className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MentalEase</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.title === "Dashboard"}
                    className="hover:bg-gray-50 my-1 p-4"
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5 text-gray-700" />
                      <span className="text-gray-900 text-[16px]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-6">
            <Link href="/dashboard/emergency-assistance">
              <Button variant="destructive" className="w-full justify-start gap-2">
                <AlertOctagon className="h-5 w-5" />
                <span>Emergency Assistance</span>
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content - Optimized with React.memo components */}
        <DashboardContent
          firstName={firstName}
          isMoodModalOpen={isMoodModalOpen}
          setIsMoodModalOpen={setIsMoodModalOpen}
          handleMoodSelection={handleMoodSelection}
          dailyQuote={dailyQuote}
          moodSummary={moodSummary}
          totalMoods={totalMoods}
          moodData={moodData}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />

        <Toaster richColors position="top-center" />
      </div>
    </SidebarProvider>
  );
}

// Memoized Dashboard Content Component
const DashboardContent = React.memo(({
  firstName,
  isMoodModalOpen,
  setIsMoodModalOpen,
  handleMoodSelection,
  dailyQuote,
  moodSummary,
  totalMoods,
  moodData,
  selectedMonth,
  setSelectedMonth
}: {
  firstName: string;
  isMoodModalOpen: boolean;
  setIsMoodModalOpen: (val: boolean) => void;
  handleMoodSelection: (mood: string) => void;
  dailyQuote: DailyQuote | null;
  moodSummary: { happy: number; neutral: number; sad: number };
  totalMoods: number;
  moodData: MoodData;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
}) => {
  return (
    <main className="flex-1 overflow-auto p-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto w-full max-w-7xl">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back to MentalEase. How are you feeling today?</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-8">
          <WelcomeCard
            firstName={firstName}
            isMoodModalOpen={isMoodModalOpen}
            setIsMoodModalOpen={setIsMoodModalOpen}
            handleMoodSelection={handleMoodSelection}
          />

          <DailyQuoteCard dailyQuote={dailyQuote} />

          <QuickActionsCard />

          <MoodSummaryCard
            moodSummary={moodSummary}
            totalMoods={totalMoods}
          />

          <MoodTrackingCalendar
            moodData={moodData}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />

          <ResourcesCard />
        </div>
      </div>
    </main>
  );
});

// Memoized Card Components
const WelcomeCard = React.memo(({
  firstName,
  isMoodModalOpen,
  setIsMoodModalOpen,
  handleMoodSelection
}: {
  firstName: string;
  isMoodModalOpen: boolean;
  setIsMoodModalOpen: (val: boolean) => void;
  handleMoodSelection: (mood: string) => void;
}) => (
  <Card className="bg-white shadow-lg">
    <CardContent className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome {firstName}</h2>
          <p className="mt-1 text-gray-600">Your personal mental health companion</p>
        </div>

        <Dialog open={isMoodModalOpen} onOpenChange={setIsMoodModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How are you feeling today?</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={() => handleMoodSelection("happy")}
              >
                😊 Happy
              </Button>
              <Button
                className="bg-yellow-500 text-white hover:bg-yellow-600"
                onClick={() => handleMoodSelection("neutral")}
              >
                😐 Neutral
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => handleMoodSelection("sad")}
              >
                😔 Sad
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Link href="/dashboard/chat">
            <MessageSquare className="h-4 w-4" />
            <span>Chat with AI</span>
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
));

const DailyQuoteCard = React.memo(({ dailyQuote }: { dailyQuote: DailyQuote | null }) => (
  <Card className="bg-white shadow-lg">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-gray-900">Daily Motivation</CardTitle>
    </CardHeader>
    <CardContent>
      {dailyQuote ? (
        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <blockquote className="text-lg italic text-gray-800">"{dailyQuote.q}"</blockquote>
          <p className="mt-4 text-right font-medium text-gray-600">— {dailyQuote.a}</p>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-100 p-6 text-center text-gray-600">
          Couldn't load quote. Please try again.
        </div>
      )}
    </CardContent>
  </Card>
));

const QuickActionsCard = React.memo(() => (
  <Card className="bg-white shadow-lg">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {ACTIONS.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="flex h-24 flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50"
            asChild
          >
            <Link href={action.href}>
              <action.icon className={cn("h-6 w-6", action.color)} />
              <span className="text-gray-900">{action.title}</span>
            </Link>
          </Button>
        ))}
      </div>
    </CardContent>
  </Card>
));

const MoodSummaryCard = React.memo(({
  moodSummary,
  totalMoods
}: {
  moodSummary: { happy: number; neutral: number; sad: number };
  totalMoods: number;
}) => {
  const calculatePercentage = (value: number) =>
    totalMoods > 0 ? Math.round((value / totalMoods) * 100) : 0;

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Monthly Mood Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {["happy", "neutral", "sad"].map((mood) => {
            const count = moodSummary[mood as keyof typeof moodSummary] || 0;
            const percentage = calculatePercentage(count);

            return (
              <div key={mood} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{mood}</span>
                  <span className="font-medium text-gray-900">{percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      mood === "happy" && "bg-green-500",
                      mood === "neutral" && "bg-blue-500",
                      mood === "sad" && "bg-red-500",
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

const MoodTrackingCalendar = React.memo(({
  moodData,
  selectedMonth,
  setSelectedMonth
}: {
  moodData: MoodData;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
}) => {
  // State to track which date's tooltip is visible
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-gray-900">Mood Tracking</CardTitle>
        <div className="flex items-center space-x-2">
          {["happy", "neutral", "sad"].map((mood) => (
            <div key={mood} className="flex items-center space-x-1">
              <div
                className={cn(
                  "h-3 w-3 rounded-full",
                  mood === "happy" && "bg-green-500",
                  mood === "neutral" && "bg-blue-500",
                  mood === "sad" && "bg-red-500",
                )}
              />
              <span className="text-xs text-gray-600 capitalize">{mood}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4 md:hidden">
          <span className="text-lg font-bold">
            {format(selectedMonth, "MMMM yyyy")}
          </span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => {
              const prevMonth = new Date(selectedMonth);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setSelectedMonth(prevMonth);
            }}
          >
            Previous Month
          </Button>
          <span className="text-lg font-bold hidden md:block">
            {format(selectedMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              const nextMonth = new Date(selectedMonth);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setSelectedMonth(nextMonth);
            }}
          >
            Next Month
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            const currentDate = new Date(Date.UTC(
              selectedMonth.getUTCFullYear(),
              selectedMonth.getUTCMonth(),
              day,
              0, 0, 0, 0
            ));

            if (currentDate.getUTCMonth() !== selectedMonth.getUTCMonth()) {
              return <div key={day} className="h-10 w-10" />;
            }

            const dateString = format(currentDate, "yyyy-MM-dd");
            const mood = moodData[dateString];

            let bgColor = "bg-gray-200";
            if (mood === "happy") bgColor = "bg-green-500";
            if (mood === "neutral") bgColor = "bg-blue-500";
            if (mood === "sad") bgColor = "bg-red-500";

            const isToday = currentDate.getTime() === new Date().setHours(10, 10, 10, 10);

            return (
              <div
                key={day}
                className="relative group"
                onMouseEnter={() => setHoveredDate(dateString)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm cursor-pointer transition-all",
                    bgColor,
                    mood ? "text-white" : "text-gray-900",
                    hoveredDate === dateString && "ring-2 ring-offset-2 ring-indigo-500",
                    isToday && "border-2 border-indigo-500"
                  )}
                >
                  {day}
                </div>

                {/* Tooltip showing mood reason */}
                {hoveredDate === dateString && (
                  <div className="absolute z-10 w-30 p-2 mt-2 text-sm text-indigo-700 bg-white border border-indigo-200 rounded-lg shadow-lg">
                    {currentDate.getTime() <= new Date().setHours(23, 59, 59, 999) ? (
                      mood ? (
                        <>
                          <div
                            className={cn(
                              "font-medium capitalize",
                              mood === "happy" && "text-green-500",
                              mood === "neutral" && "text-blue-500",
                              mood === "sad" && "text-red-500"
                            )}
                          >
                            {mood}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(currentDate, "MMMM d, yyyy")}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-gray-500">
                            No mood recorded
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(currentDate, "MMMM d, yyyy")}
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <div className="font-medium text-indigo-500">
                          Mood tracking not available yet
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(currentDate, "MMMM d, yyyy")}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
const ResourcesCard = React.memo(() => (
  <Card className="bg-white shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-xl font-bold text-gray-900">Mental Health Resources</CardTitle>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/resources" className="gap-1 text-blue-600 hover:text-blue-700">
          <span>View all</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4 md:grid-cols-3">
        {RESOURCES.map((resource) => (
          <Card key={resource.title} className="bg-white shadow-sm">
            <div className="p-6">
              <resource.icon className="h-8 w-8 text-blue-600" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">{resource.title}</h3>
              <p className="text-xs text-gray-600">{resource.type}</p>
              <p className="mt-2 text-sm text-gray-600">{resource.description}</p>
              <Button variant="link" className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-700" asChild>
                <Link target="_blank" href={resource.href}>Read more</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
));