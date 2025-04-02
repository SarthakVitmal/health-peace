"use client";

import { useEffect, useState } from "react";
import { Smile, Meh, Frown, AlertTriangle, Zap } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import { cn } from "@/lib/utils"; 

const moods = [
  { label: "Happy", icon: <Smile className="h-6 w-6" />, color: "bg-green-500" },
  { label: "Neutral", icon: <Frown className="h-6 w-6" />, color: "bg-blue-500" },
  { label: "Sad", icon: <Zap className="h-6 w-6" />, color: "bg-indigo-500" },
];

export default function MoodModal({ userId }: { userId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");

  useEffect(() => {
    const lastLoggedDate = localStorage.getItem("lastMoodDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastLoggedDate !== today) {
      setShowModal(true);
    }
  }, []);

  const submitMood = async () => {
    if (!selectedMood) return;

    await fetch("/api/mood", {
      method: "POST",
      body: JSON.stringify({ userId, mood: selectedMood }),
      headers: { "Content-Type": "application/json" },
    });

    // Save today's date in local storage
    localStorage.setItem("lastMoodDate", new Date().toISOString().split("T")[0]);
    setShowModal(false);
  };

  return (
    showModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How are you feeling today?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.label}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200",
                  "hover:scale-105 hover:shadow-md",
                  selectedMood === mood.label
                    ? `${mood.color} text-white`
                    : "bg-gray-100 text-gray-700"
                )}
                onClick={() => setSelectedMood(mood.label)}
              >
                <div className="mb-2">{mood.icon}</div>
                <span className="text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button
              className={cn(
                "bg-primary text-white px-6 py-2 rounded-md transition-all duration-200",
                "hover:bg-primary-dark hover:shadow-lg",
                !selectedMood && "opacity-50 cursor-not-allowed"
              )}
              onClick={submitMood}
              disabled={!selectedMood}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    )
  );
}