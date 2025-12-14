"use client";

import { Attachment } from "@prisma/client";
import { Download, File, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  attachments: Attachment[];
}

export function LessonAttachments({ attachments }: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      {attachments.map((attachment) => (
        <AttachmentItem key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}

function AttachmentItem({ attachment }: { attachment: Attachment }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownload = async () => {
    setIsDownloading(true);
    const response = await fetch(attachment.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.name;
    link.click();
    window.URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-x-2 p-2 hover:bg-accent group rounded-md transition-colors w-full text-left"
    >
      <File className="size-4 text-muted-foreground group-hover:text-primary" />
      <p className="text-sm text-muted-foreground group-hover:text-primary">
        {attachment.name}
      </p>
      <Download className="size-4 md:opacity-0 group-hover:opacity-100 transition-opacity" />
      {isDownloading && <Loader2 className="size-4 animate-spin" />}
    </button>
  );
}
