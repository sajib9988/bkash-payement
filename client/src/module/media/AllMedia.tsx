"use client";

import { useEffect, useState } from "react";
import MediaCard from "./MediaCard";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getAllMedia } from "@/service/media";
import { Media, IMediaFilter, MediaParams } from "@/type/type";

const AllMedia = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<IMediaFilter>({
    genre: undefined,
    releaseDate: undefined,
    type: undefined,
    searchTerm: "",
    title: "",
  });

  const fetchMedia = async () => {
    try {
      setLoading(true);

      const options: MediaParams = {
        sortBy: "createdAt",
        sortOrder: "desc",
        genre: filters.genre === "ALL" ? undefined : filters.genre,
        releaseDate: filters.releaseDate === "ALL" ? undefined : filters.releaseDate,
        type: filters.type === "ALL" ? undefined : filters.type,
        searchTerm: filters.searchTerm || undefined,
        title: filters.title || undefined,
      };

          console.log("🔍 API Filter Options:", options);

      const response = await getAllMedia(options);

      if (response?.data?.data && Array.isArray(response.data.data)) {
        setMediaList(response.data.data);
      } else {
        setMediaList([]);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      setMediaList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filters]);

  const handleFilterChange = (key: keyof IMediaFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "ALL" ? undefined : value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      genre: undefined,
      releaseDate: undefined,
      type: undefined,
      searchTerm: "",
      title: "",
    });
  };

  const genres = ["ALL", "Action", "Drama", "Comedy", "Thriller", "Sci-Fi"];
  const years = ["ALL", "2025", "2024", "2023", "2022", "2021"];
  const types = ["ALL", "MOVIE", "SERIES"];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Filter Sidebar */}
      <div className="md:w-1/4 w-full bg-gray-100 p-4 rounded-lg shadow-md h-fit">
        <h2 className="text-xl font-semibold mb-4">Filter Media</h2>

        {/* Genre Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
          <Select
            value={filters.genre ?? "ALL"}
            onValueChange={(value) => handleFilterChange("genre", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Release Year Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
          <Select
            value={filters.releaseDate ?? "ALL"}
            onValueChange={(value) => handleFilterChange("releaseDate", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <Select
            value={filters.type ?? "ALL"}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <Button onClick={resetFilters} className="w-full bg-red-500 hover:bg-red-600">
          Reset Filters
        </Button>
      </div>

      {/* Media Display */}
      <div className="md:w-3/4 w-full">
        {loading ? (
          <div className="text-center text-lg mt-10">Loading...</div>
        ) : mediaList.length === 0 ? (
          <div className="text-center text-lg text-gray-500 mt-10">
            No media found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {mediaList.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllMedia;
