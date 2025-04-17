"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

export function TextGenerateEffect({
  words,
  className,
}: {
  words: string;
  className?: string;
}) {
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  // Memoize the words array to prevent recreation on every render
  const wordsArray = useMemo(() => words.split(" "), [words]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset state when words change
    setDisplayedWords([]);
    setIsComplete(false);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const reveal = (index = 0, currentWords: string[] = []) => {
      if (index >= wordsArray.length) {
        setIsComplete(true);
        return;
      }
      
      const nextWords = [...currentWords, wordsArray[index]];
      setDisplayedWords(nextWords);
      
      const delay = Math.max(100, Math.floor(Math.random() * 180));
      timeoutRef.current = setTimeout(() => reveal(index + 1, nextWords), delay);
    };

    timeoutRef.current = setTimeout(() => reveal(), 300);
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [words, wordsArray]); // Include wordsArray for completeness

  return (
    <div className={cn("relative", className)}>
      <div className="relative whitespace-nowrap">
        {/* Invisible placeholder for height */}
        <div className="absolute whitespace-nowrap opacity-0">
          {words}
        </div>
        
        {/* Animated words */}
        <div className="relative whitespace-nowrap flex">
          {wordsArray.map((word, index) => {
            const isVisible = index < displayedWords.length;
            return (
              <React.Fragment key={`${word}-${index}`}>
                <motion.span
                  className="inline-block"
                  initial={{ 
                    opacity: 0,
                    filter: "blur(8px)",
                    y: 10 
                  }}
                  animate={isVisible ? {
                    opacity: 1,
                    filter: "blur(0px)",
                    y: 0
                  } : {}}
                  transition={{
                    duration: 0.4,
                    ease: [0.2, 0.8, 0.4, 1]
                  }}
                >
                  {word}
                </motion.span>
                
                {/* Add space between words, but not after the last word */}
                {index < wordsArray.length - 1 && (
                  <span className="inline-block w-[0.3em]"></span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
