"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Loader2, AlertCircle, Play, Pause, Volume2, Info, RefreshCw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const MusicSearch = () => {
  const [selectedOption, setSelectedOption] = useState("songs");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const [isMentalHealthRelated, setIsMentalHealthRelated] = useState(true);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [recommendedSongs, setRecommendedSongs] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  // Mental health music related keywords
  const moodKeywords: Record<string, string[]> = {
    happy: ["happy", "joyful", "upbeat", "energetic", "positive", "excited"],
    neutral: ["calm", "peaceful", "relaxing", "instrumental", "ambient"],
    sad: ["healing", "comforting", "melancholic", "emotional", "soothing"],
    angry: ["calming", "stress relief", "meditation", "peaceful", "relaxing"],
    anxious: ["anxiety relief", "calm", "meditation", "breathing", "nature sounds"]
  };

  //fetch userid
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();

        if (response.ok) {
          setUserId(data.user._id);
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

  //fetch todays mood
  useEffect(() => {
    const fetchTodayMood = async () => {
      try {
        const today = format(new Date(), "yyyy-MM-dd");
        const response = await fetch(`/api/mood?userId=${userId}&date=${today}`);
        const data = await response.json();
        console.log(data)
    
        if (response.ok && data.mood) {
          setCurrentMood(data.mood.mood || data.mood);
          fetchRecommendedSongs(data.mood.mood || data.moods);
        }
      } catch (error) {
        console.error("Error fetching today's mood:", error);
      }
    };

    if (userId) {
      fetchTodayMood();
    }
  }, [userId]);

  const fetchRecommendedSongs = async (mood: string) => {
    setLoadingRecommendations(true);
    setRecommendationError("");
    
    try {
      const keywords = moodKeywords[mood] || moodKeywords.neutral;
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      
      const token = await getSpotifyToken();
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(randomKeyword)}&type=track&limit=6`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommended songs");
      }

      const data = await response.json();
      setRecommendedSongs(data.tracks.items);
    } catch (err) {
      setRecommendationError("Failed to load recommendations");
      console.error("Error fetching recommended songs:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };
  useEffect(() => {
    console.log("Current mood:", currentMood);
    console.log("Recommended songs:", recommendedSongs);
  }, [currentMood, recommendedSongs]);
  // Check if the search query is related to mental health
  const checkIfMentalHealthRelated = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(moodKeywords).flat().some((keyword: string) => lowercaseQuery.includes(keyword.toLowerCase()));
  };

  // Get Spotify access token
  const getSpotifyToken = async () => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "",
        client_secret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || "",
      }),
    });
    const data = await response.json();
    return data.access_token;
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setError("Please enter a search term");
      return;
    }
    setHasSearched(true);
    setIsLoading(true);
    setError("");
    setPlayingAudio(null);

    // Check if the search is mental health related
    const isRelated = checkIfMentalHealthRelated(searchQuery);
    setIsMentalHealthRelated(isRelated);

    if (!isRelated) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    try {
      if (selectedOption === "playlists") {
        await fetchPlaylists(searchQuery);
      } else {
        await fetchSongs(searchQuery);
      }
    } catch (err) {
      setError("An error occurred while fetching results. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch songs from Spotify
  const fetchSongs = async (query: string) => {
    const token = await getSpotifyToken();
    const enhancedQuery = `${query} meditation relaxation`;
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(enhancedQuery)}&type=track&limit=12`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch songs");
    }

    const data = await response.json();
    setResults(data.tracks.items);
  };

  // Fetch playlists from Spotify
  const fetchPlaylists = async (query: string) => {
    const token = await getSpotifyToken();
    const enhancedQuery = `${query} meditation relaxation playlist`;
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(enhancedQuery)}&type=playlist&limit=12`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch playlists");
    }

    const data = await response.json();
    setResults(data.playlists.items);
  };

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Toggle audio playback
  const toggleAudio = (trackId: string, previewUrl: string) => {
    if (audioElements[trackId]) {
      if (playingAudio === trackId) {
        audioElements[trackId].pause();
        setPlayingAudio(null);
      } else {
        if (playingAudio && audioElements[playingAudio]) {
          audioElements[playingAudio].pause();
        }
        audioElements[trackId].play();
        setPlayingAudio(trackId);
      }
    } else if (previewUrl) {
      const audio = new Audio(previewUrl);
      audio.addEventListener("ended", () => setPlayingAudio(null));
      audio.addEventListener("error", () => {
        setError("Unable to play this track. Try another one.");
        setPlayingAudio(null);
      });
      setAudioElements((prev) => ({ ...prev, [trackId]: audio }));
      if (playingAudio && audioElements[playingAudio]) {
        audioElements[playingAudio].pause();
      }
      audio.play().catch((err) => {
        console.error("Error playing audio:", err);
        setError("Unable to play this track. Try another one.");
      });
      setPlayingAudio(trackId);
    } else {
      setError("No preview available for this track.");
    }
  };

  // Set volume for audio
  const setVolume = (trackId: string, volume: number[]) => {
    if (audioElements[trackId]) {
      audioElements[trackId].volume = volume[0] / 100;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">MindEase Music</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover and listen to calming, royalty-free music to help you relax and focus
          </p>
        </div>

        <Tabs defaultValue="songs" value={selectedOption} onValueChange={setSelectedOption} className="mb-8">
          <div className="flex justify-center mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="songs" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Songs
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-xl">
            <Input
              type="text"
              placeholder="Search for relaxation, meditation, or focus music..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-20"
            />
            <Button onClick={handleSearch} className="absolute right-0 top-0 rounded-l-none" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center p-4 mb-6 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4 mr-2" />
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}

        {searchQuery && !isMentalHealthRelated && (
          <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg mb-8">
            <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-amber-800 mb-1">MindEase Music Focus Only</h3>
            <p className="text-amber-700">
              Please search for mental health related music. Try keywords like meditation, relaxation, calm, sleep,
              focus, or mindfulness.
            </p>
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
          ) : results.length > 0 ? (
            results.map((item, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow"
              >
                {selectedOption === "playlists" ? (
                  <>
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={item.images[0]?.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base line-clamp-2">{item.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{item.owner.display_name}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {item.tracks.total} Tracks
                      </Badge>
                      <a
                        href={item.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Open Playlist
                      </a>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      <img
                        src={item.album.images[0]?.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-4 right-4 rounded-full w-12 h-12 bg-primary/90 text-primary-foreground hover:bg-primary"
                        onClick={() => toggleAudio(item.id, item.preview_url)}
                      >
                        {playingAudio === item.id ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </Button>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base line-clamp-2">{item.name}</CardTitle>
                      <CardDescription className="line-clamp-1 mt-1">
                        {item.artists.map((artist: any) => artist.name).join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {playingAudio === item.id && (
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <Slider
                            defaultValue={[100]}
                            max={100}
                            step={1}
                            className="w-full"
                            onValueChange={(value) => setVolume(item.id, value)}
                          />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.explicit ? "Explicit" : "Clean"}
                      </Badge>
                      <a
                        href={item.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Open in Spotify
                      </a>
                    </CardFooter>
                  </>
                )}
              </Card>
            ))
          ) : searchQuery ? (
            <div className="col-span-full text-center p-10">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isMentalHealthRelated
                  ? "We couldn't find any music matching your search. Try different keywords."
                  : "Please search for mental health related music only."}
              </p>
            </div>
          ) : (
            <div className="col-span-full text-center p-10">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Search for relaxing music</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter keywords like "meditation", "relaxation", "sleep", or "focus" to find music to enhance your
                mindfulness practice.
              </p>
            </div>
          )}
        </div>

        {currentMood && !hasSearched && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Recommended for your {currentMood} mood
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => fetchRecommendedSongs(currentMood)}
                disabled={loadingRecommendations}
              >
                {loadingRecommendations ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>

            {recommendationError && (
              <div className="flex items-center justify-center p-4 mb-6 bg-destructive/10 text-destructive rounded-md">
                <AlertCircle className="h-4 w-4 mr-2" />
                {recommendationError}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loadingRecommendations ? (
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <Card key={index} className="border border-border/50 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-6 flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))
              ) : recommendedSongs.length > 0 ? (
                recommendedSongs.map((item, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      <img
                        src={item.album.images[0]?.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-4 right-4 rounded-full w-12 h-12 bg-primary/90 text-primary-foreground hover:bg-primary"
                        onClick={() => toggleAudio(item.id, item.preview_url)}
                      >
                        {playingAudio === item.id ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6" />
                        )}
                      </Button>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base line-clamp-2">{item.name}</CardTitle>
                      <CardDescription className="line-clamp-1 mt-1">
                        {item.artists.map((artist: any) => artist.name).join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {playingAudio === item.id && (
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <Slider
                            defaultValue={[100]}
                            max={100}
                            step={1}
                            className="w-full"
                            onValueChange={(value) => setVolume(item.id, value)}
                          />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Badge variant="outline" className="text-xs">
                        {item.explicit ? "Explicit" : "Clean"}
                      </Badge>
                      <a
                        href={item.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Open in Spotify
                      </a>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center p-6 bg-muted rounded-lg">
                  <p className="text-muted-foreground">No recommendations available</p>
                </div>
              )}
            </div>
          </div>
        )}


        {results.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            <Info className="h-4 w-4" />
            <p>All music shown is safe for personal use.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicSearch;