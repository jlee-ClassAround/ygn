"use client";

import { Copy } from "lucide-react";
import toast from "react-hot-toast";

export const CopyButton = ({
  text,
  successMessage,
}: {
  text?: string | null;
  successMessage: string;
}) => {
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={() => {
        if (text) {
          navigator.clipboard.writeText(text);
          toast.success(successMessage);
        }
      }}
      className="hover:bg-foreground/10 cursor-pointer rounded p-1 transition-colors"
    >
      <Copy className="text-muted-foreground size-4" />
    </button>
  );
};
