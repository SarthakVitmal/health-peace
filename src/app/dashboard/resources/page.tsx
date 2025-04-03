"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Video, Loader2, AlertCircle } from "lucide-react"

const Resources = () => {
  const [selectedOption, setSelectedOption] = useState("videos")
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMentalHealthRelated, setIsMentalHealthRelated] = useState(true)

  // Mental health related keywords to check against
  const mentalHealthKeywords = [
    "anxiety",
    "depression",
    "stress",
    "mindfulness",
    "meditation",
    "therapy",
    "mental health",
    "wellness",
    "self-care",
    "psychology",
    "counseling",
    "trauma",
    "healing",
    "emotional",
    "wellbeing",
    "coping",
    "resilience",
    "mental wellness",
    "mental illness",
    "psychiatric",
    "psychological",
    "therapeutic",
    "relaxation",
  ]

  const checkIfMentalHealthRelated = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return mentalHealthKeywords.some((keyword) => lowercaseQuery.includes(keyword.toLowerCase()))
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term")
      return
    }

    setIsLoading(true)
    setError("")

    // Check if the search is mental health related
    const isRelated = checkIfMentalHealthRelated(searchQuery)
    setIsMentalHealthRelated(isRelated)

    if (!isRelated) {
      setResults([])
      setIsLoading(false)
      return
    }

    try {
      if (selectedOption === "videos") {
        await fetchVideos(searchQuery)
      } else {
        await fetchArticles(searchQuery)
      }
    } catch (err) {
      setError("An error occurred while fetching results. Please try again.")
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchVideos = async (query: string) => {
    const mentalHealthQuery = `${query} mental health wellness`

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(mentalHealthQuery)}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}&type=video&maxResults=10`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch videos")
    }

    const data = await response.json()
    setResults(data.items || [])
  }

  const fetchArticles = async (query: string) => {
    const mentalHealthQuery = `${query} mental health wellness`;
  
    try {
      const response = await fetch(
        `/api/news-api?query=${encodeURIComponent(mentalHealthQuery)}`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      // Handle NewsAPI errors
      if (data.status === "error") {
        throw new Error(data.message || "NewsAPI error");
      }
  
      setResults(data.articles || []);
    } catch (err) {
      console.error('Fetch articles error:', err);
      throw new Error("Failed to fetch articles. Please try again later.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">MindEase Resources</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover helpful articles and videos to support your mental health journey
          </p>
        </div>

        <Tabs defaultValue="articles" value={selectedOption} onValueChange={setSelectedOption} className="mb-8">
          <div className="flex justify-center mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Articles
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-xl">
            <Input
              type="text"
              placeholder="Search for mental health resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-20"
            />
            <Button onClick={handleSearch} className="absolute right-0 top-0 rounded-l-none bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
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

        {searchQuery && !isMentalHealthRelated && (
          <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg mb-8">
            <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-amber-800 mb-1">Mental Health Focus Only</h3>
            <p className="text-amber-700">
              Please search for mental health related topics. Try keywords like anxiety, depression, mindfulness,
              therapy, or wellness.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(3)
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
                {selectedOption === "videos" ? (
                  <>
                    <div className="aspect-video w-full">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${item.id?.videoId}`}
                        title={item.snippet?.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base line-clamp-2">{item.snippet?.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{item.snippet?.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Badge variant="outline" className="text-xs">
                        {new Date(item.snippet?.publishedAt).toLocaleDateString()}
                      </Badge>
                      <a
                        href={`https://www.youtube.com/watch?v=${item.id?.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Watch on YouTube
                      </a>
                    </CardFooter>
                  </>
                ) : (
                  <>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-1">
                        {item.source?.name} • {new Date(item.publishedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Read full article
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
                  ? "We couldn't find any resources matching your search. Try different keywords."
                  : "Please search for mental health related topics only."}
              </p>
            </div>
          ) : (
            <div className="col-span-full text-center p-10">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Search for resources</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter keywords related to mental health topics like anxiety, depression, mindfulness, or therapy to find
                helpful resources.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Resources

