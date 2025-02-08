import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Video } from "@shared/schema";
import { FileVideo, Upload, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: videos, isLoading } = useQuery<Video[]>({ 
    queryKey: ["/api/videos", search ? `?search=${search}` : ""]
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Video Stream</h1>
        <Link href="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search videos..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : videos?.length === 0 ? (
        <Card className="p-8 text-center">
          <FileVideo className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg">No videos found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos?.map((video) => (
            <Link key={video.id} href={`/video/${video.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <video
                    className="w-full aspect-video bg-black mb-4"
                    preload="metadata"
                  >
                    <source src={`/api/stream/${video.filename}`} type={video.mimeType} />
                  </video>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>Uploaded {new Date(video.uploadedAt).toLocaleString()}</span>
                    <span>{video.views} views</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}