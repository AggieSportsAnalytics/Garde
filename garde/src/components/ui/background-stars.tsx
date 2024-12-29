"use client";
import React from "react";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";

export const BackgroundStars = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("h-full w-full bg-black", className)}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute inset-0 bg-grid-white/[0.05] bg-[length:50px_50px]" 
      />
      <div className="absolute h-full w-full">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute h-full w-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent,white)]" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="absolute inset-0 bg-[url(/stars.svg)] bg-repeat bg-[length:300px_300px]" 
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}; 