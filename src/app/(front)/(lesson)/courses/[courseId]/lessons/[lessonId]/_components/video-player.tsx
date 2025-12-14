"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import ReactPlayer from "react-player";
import { completeLesson } from "../actions/complete-lesson";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  videoType?: string;
  videoUrl: string;
  nextLessonId: string | null;
  isCompleted: boolean;
  lessonId: string;
  courseId: string;
}

export function VideoPlayer({
  videoType = "vimeo",
  videoUrl,
  nextLessonId,
  isCompleted,
  lessonId,
  courseId,
}: Props) {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const onComplete = async () => {
    try {
      if (!isCompleted) {
        await completeLesson({ lessonId });
        toast.success("완료되었습니다.");
        router.refresh();
        return;
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    }
  };

  const onEnd = () => {
    try {
      if (nextLessonId) {
        router.push(`/courses/${courseId}/lessons/${nextLessonId}`);
        return;
      }
    } catch {
      toast.error("오류가 발생했습니다.");
    }
  };

  return (
    <div className="relative aspect-video bg-foreground/10 rounded-lg overflow-hidden shadow-md">
      {!isReady && (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col gap-y-2 items-center justify-center bg-black bg-opacity-40">
          <Loader2 className="size-10 text-foreground/70 animate-spin" />
          <span className="text-sm text-foreground/70 font-medium">
            로딩 중 입니다. 잠시만 기다려주세요.
          </span>
        </div>
      )}
      <ReactPlayer
        {...(videoType === "vimeo"
          ? { url: "https://player.vimeo.com/video" }
          : videoType === "youtube"
          ? {
              url: videoUrl,
            }
          : { url: videoUrl })}
        playing
        width="100%"
        height="100%"
        controls
        {...(videoType === "vimeo"
          ? {
              config: {
                vimeo: {
                  playerOptions: {
                    url: videoUrl,
                  },
                },
              },
            }
          : {})}
        onReady={() => {
          setIsReady(true);
        }}
        onEnded={onEnd}
        onProgress={({ played }) => {
          if (played > 0.9) onComplete();
        }}
        progressInterval={10000}
      />
    </div>
  );
}
