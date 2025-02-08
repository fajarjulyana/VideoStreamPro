import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Video, Comment, insertCommentSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export default function VideoPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  const { data: video, isLoading: isLoadingVideo } = useQuery<Video>({
    queryKey: [`/api/videos/${id}`]
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: [`/api/videos/${id}/comments`]
  });

 const mutation = useMutation({
  mutationFn: async ({ content, videoId }: { content: string; videoId: number }) => {
    try {
      await apiRequest("POST", `/api/videos/${id}/comments`, { content, videoId });
    } catch (error) {
      console.error("Error during mutation:", error);
      throw error;
    }
  },

    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${id}/comments`] });
      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error during onError:", error); // Log the error here
      toast({
        title: "Error",
        description: "There was an issue submitting your comment",
        variant: "destructive",
      });
    },
  });

const handleSubmitComment = async () => {
  if (!comment.trim()) {
    toast({
      title: "Error",
      description: "Comment cannot be empty",
      variant: "destructive",
    });
    return;
  }

  try {
    console.log("Validating comment:", { content: comment, videoId: Number(id) });

    insertCommentSchema.parse({ content: comment, videoId: Number(id) });

    console.log("Validation passed. Sending data...");
    
    mutation.mutate({ content: comment, videoId: Number(id) });



  } catch (err) {
    console.error("Validation error:", err);
    toast({
      title: "Error",
      description: "Invalid comment format",
      variant: "destructive",
    });
  }
};


  if (isLoadingVideo) {
    return (
      <div className="container mx-auto p-4">
        <Card className="animate-pulse">
          <CardContent className="h-96" />
        </Card>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-8 text-center">
          <p className="text-lg">Video not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/" className="inline-flex mb-8">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{video.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <video
            controls
            className="w-full aspect-video bg-black"
            preload="metadata"
          >
            <source src={`/api/stream/${video.filename}`} type={video.mimeType} />
            Your browser does not support the video tag.
          </video>

          {video.description && (
            <p className="mt-4 text-muted-foreground">{video.description}</p>
          )}

          <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
            <span>Uploaded {new Date(video.uploadedAt).toLocaleString()}</span>
            <span>{video.views} views</span>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>

            <div className="flex gap-2 mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={mutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {isLoadingComments ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-20" />
                  </Card>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="py-4">
                      <p>{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

