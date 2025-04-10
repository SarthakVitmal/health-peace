"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
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

const ACTIONS = [
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
  const abortController = useRef(new AbortController());
  const retryCountRef = useRef(0);

  const router = useRouter();
  const { data: session } = useSession();
  const { isLoggedIn, checkAuthStatus } = useAuth();

  // Memoized mood summary
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

  const fetchWithRetry = useCallback(async (url: string, options: RequestInit = {}, retries = 3) => {
    try {
      const response = await fetch(url, {
        ...options,
        signal: abortController.current.signal,
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await fetchWithRetry("/api/auth/user");
      setFirstName(userData.user.firstName);
      setUserId(userData.user._id);
      setError("");
    } catch (error) {
      setError("Failed to fetch user data");
      if (retryCountRef.current < 2) {
        retryCountRef.current += 1;
        setTimeout(fetchUserData, 2000);
      } else {
        router.replace("/login");
      }
    }
  }, [fetchWithRetry, router]);

  const fetchMoodData = useCallback(async () => {
    if (!userId) return;
    try {
      const month = format(selectedMonth, "yyyy-MM");
      const data = await fetchWithRetry(`/api/mood?userId=${userId}&month=${month}`);
      
      const formattedData = data.moods.reduce((acc: MoodData, mood: { date: string; mood: string }) => {
        acc[format(new Date(mood.date), "yyyy-MM-dd")] = mood.mood;
        return acc;
      }, {});
      setMoodData(formattedData);
    } catch (error) {
      console.error("Mood data fetch error:", error);
    }
  }, [userId, selectedMonth, fetchWithRetry]);

  const checkMoodStatus = useCallback(async () => {
    if (!userId) return;
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const data = await fetchWithRetry(`/api/mood?userId=${userId}&date=${today}`);
      if (!data.mood) setIsMoodModalOpen(true);
    } catch (error) {
      console.error("Mood check error:", error);
    }
  }, [userId, fetchWithRetry]);

  const handleMoodSelection = useCallback(async (mood: string) => {
    setIsMoodModalOpen(false);
    try {
      await fetchWithRetry("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mood, today: format(new Date(), "yyyy-MM-dd") })
      });
      await fetchMoodData();
      toast.success("Mood recorded successfully!");
    } catch (error) {
      toast.error("Failed to record mood");
    }
  }, [userId, fetchMoodData, fetchWithRetry]);

  const fetchDailyQuote = useCallback(async () => {
    try {
      const cachedQuote = localStorage.getItem('dailyQuote');
      if (cachedQuote) setDailyQuote(JSON.parse(cachedQuote));
      
      const data = await fetchWithRetry('/api/quotes');
      localStorage.setItem('dailyQuote', JSON.stringify(data));
      setDailyQuote(data);
    } catch (error) {
      setDailyQuote(FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]);
    }
  }, [fetchWithRetry]);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const isValid = await checkAuthStatus();
        if (!isValid) return router.replace("/login");

        await Promise.all([
          fetchUserData(),
          fetchDailyQuote()
        ]);
        
        await fetchMoodData();
        checkMoodStatus();
      } catch (error) {
        setError("Failed to initialize dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();

    return () => {
      abortController.current.abort();
      abortController.current = new AbortController();
    };
  }, [checkAuthStatus, fetchUserData, fetchMoodData, fetchDailyQuote, checkMoodStatus, router]);

  if (isLoading) return <Loader />;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
      <div className="max-w-md text-center space-y-6">
        <AlertOctagon className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Loading Error</h2>
        <p className="text-gray-600">Failed to load dashboard data</p>
        <Button onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
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

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back to MentalEase. How are you feeling today?</p>
            </div>

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

        <Toaster richColors position="top-center" />
      </div>
    </SidebarProvider>
  );
}

// Memoized Components
const WelcomeCard = React.memo(({ firstName, isMoodModalOpen, setIsMoodModalOpen, handleMoodSelection }: any) => (
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

const DailyQuoteCard = React.memo(({ dailyQuote }: any) => (
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
          Loading daily quote...
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

const MoodSummaryCard = React.memo(({ moodSummary, totalMoods }: any) => {
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

const MoodTrackingCalendar = React.memo(({ moodData, selectedMonth, setSelectedMonth }: any) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
        <div className="md:hidden flex justify-center items-center mb-4">
        <span className="text-lg font-bold">
            {format(selectedMonth, "MMMM yyyy")}
          </span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedMonth(startOfMonth(new Date().setMonth(selectedMonth.getMonth() - 1)))}
          >
            Previous Month
          </Button>
          <span className="hidden md:flex text-lg font-bold">
            {format(selectedMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            onClick={() => setSelectedMonth(startOfMonth(new Date().setMonth(selectedMonth.getMonth() + 1)))}
          >
            Next Month
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date) => {
            const dateString = format(date, "yyyy-MM-dd");
            const mood = moodData[dateString];
            const isCurrentMonth = isSameMonth(date, selectedMonth);
            const isFutureDate = date > new Date();

            if (!isCurrentMonth) return <div key={dateString} className="h-10 w-10" />;

            let bgColor = "bg-gray-200";
            if (mood === "happy") bgColor = "bg-green-500";
            if (mood === "neutral") bgColor = "bg-blue-500";
            if (mood === "sad") bgColor = "bg-red-500";

            return (
              <div
                key={dateString}
                className="relative group"
                onMouseEnter={() => !isFutureDate && setHoveredDate(dateString)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm cursor-default transition-all",
                    bgColor,
                    mood ? "text-white" : "text-gray-900",
                    hoveredDate === dateString && "ring-2 ring-offset-2 ring-indigo-500",
                    isToday(date) && "border-2 border-indigo-500"
                  )}
                >
                  {format(date, "d")}
                </div>

                {hoveredDate === dateString && (
                  <div className="absolute z-10 w-30 p-2 mt-2 text-sm text-indigo-700 bg-white border border-indigo-200 rounded-lg shadow-lg">
                    {isFutureDate ? (
                      <>
                        <div className="font-medium text-indigo-500">
                          Future Date
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(date, "MMMM d, yyyy")}
                        </div>
                      </>
                    ) : mood ? (
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
                          {format(date, "MMMM d, yyyy")}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-medium text-gray-500">
                          No mood recorded
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(date, "MMMM d, yyyy")}
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