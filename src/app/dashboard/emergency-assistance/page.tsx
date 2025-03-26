"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, AlertCircle, MapPin, Phone, Mail, Info } from "lucide-react";

const PsychiatristSearch = () => {
  const [location, setLocation] = useState("");
  const [psychiatrists, setPsychiatrists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPsychiatrists = async () => {
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/psychiatrists?location=${location}`);
      const data = await res.json();

      if (res.ok) {
        setPsychiatrists(data);
      } else {
        setPsychiatrists([]);
        setError(data.message || "No results found");
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Find a Psychiatrist Near You</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter your location to find licensed psychiatrists in your area.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-xl">
            <Input
              type="text"
              placeholder="Enter your location (e.g., city)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pr-20"
            />
            <Button
              onClick={fetchPsychiatrists}
              className="absolute right-0 top-0 rounded-l-none"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center p-4 mb-6 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="border border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ))
          ) : psychiatrists.length > 0 ? (
            psychiatrists.map((psychiatrist, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base line-clamp-2">{psychiatrist.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    {psychiatrist.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{psychiatrist.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{psychiatrist.email}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Badge variant="outline" className="text-xs">
                    Available
                  </Badge>
                  <Button variant="outline" size="sm">
                    Contact Now
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : location ? (
            <div className="col-span-full text-center p-10">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any psychiatrists matching your search. Try a different location.
              </p>
            </div>
          ) : (
            <div className="col-span-full text-center p-10">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Search for Psychiatrists</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter your location to find licensed psychiatrists near you.
              </p>
            </div>
          )}
        </div>

        {psychiatrists.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            <Info className="h-4 w-4" />
            <p>All psychiatrists listed are licensed professionals.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychiatristSearch;