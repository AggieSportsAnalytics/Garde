"use client";
import React from "react";
import { cn } from "../../../lib/utils";

export const BackgroundStars = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("h-full w-full bg-black", className)}>
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:50px_50px]" />
      <div className="absolute h-full w-full">
        <div className="absolute h-full w-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent,white)]" />
        <div className="absolute inset-0 bg-[url(/stars.svg)] bg-repeat bg-[length:300px_300px] opacity-70" />
      </div>
      {children}
    </div>
  );
}; 