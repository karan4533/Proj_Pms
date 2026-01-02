"use client";

import { Loader } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background">
      <Loader className="size-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};

export default LoadingPage;
