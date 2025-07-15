"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllMedia } from "@/service/media";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q");
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getAllMedia({
          searchTerm: searchTerm,
          limit: 20,
        });
        setResults(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to load search results. Please try again.");
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!searchTerm) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        <p className="text-gray-400">Please enter a search term to find media</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">No results for "{searchTerm}"</h1>
        <p className="text-gray-400">Try adjusting your search or browse our collections</p>
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/movies">
            <Button variant="outline">Browse Movies</Button>
          </Link>
          <Link href="/series">
            <Button variant="outline">Browse Series</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Search Results for "{searchTerm}"</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((item) => (
          <Link key={item.id} href={`${process.env.NEXT_PUBLIC_BASE_API}/media/${item.id}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-black border-gray-800 cursor-pointer">
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button variant="outline" className="rounded-full">
                    <Play className="h-5 w-5 mr-1" /> Watch Now
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold mb-1 truncate">{item.title}</h3>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{item.type}</span>
                  <span>{item.genre}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
