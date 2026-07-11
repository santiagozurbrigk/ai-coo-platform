"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CHARS_PER_FRAME = 3;

export function useStreamTypewriter(opts: { instant?: boolean }) {
  const instant = opts.instant ?? false;
  const [bufferedText, setBufferedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const bufferedRef = useRef("");
  const displayedLenRef = useRef(0);
  const streamEndedRef = useRef(false);
  const activeRef = useRef(false);

  const syncDisplayed = useCallback((text: string) => {
    displayedLenRef.current = text.length;
    setDisplayedText(text);
  }, []);

  const reset = useCallback(() => {
    bufferedRef.current = "";
    displayedLenRef.current = 0;
    streamEndedRef.current = false;
    activeRef.current = false;
    setBufferedText("");
    setDisplayedText("");
  }, []);

  const start = useCallback(() => {
    bufferedRef.current = "";
    displayedLenRef.current = 0;
    streamEndedRef.current = false;
    setBufferedText("");
    setDisplayedText("");
    activeRef.current = true;
  }, []);

  const appendBuffer = useCallback(
    (chunk: string) => {
      if (!chunk) return;
      bufferedRef.current += chunk;
      setBufferedText(bufferedRef.current);
      if (instant) {
        syncDisplayed(bufferedRef.current);
      }
    },
    [instant, syncDisplayed]
  );

  const markStreamEnded = useCallback(() => {
    streamEndedRef.current = true;
  }, []);

  const snapToBuffer = useCallback(() => {
    syncDisplayed(bufferedRef.current);
  }, [syncDisplayed]);

  const waitForCatchUp = useCallback((): Promise<void> => {
    if (instant) return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => {
        if (displayedLenRef.current >= bufferedRef.current.length) {
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
  }, [instant]);

  useEffect(() => {
    if (instant) return;

    let raf = 0;
    const tick = () => {
      if (!activeRef.current) return;
      const target = bufferedRef.current;
      const currentLen = displayedLenRef.current;
      if (currentLen < target.length) {
        const nextLen = Math.min(currentLen + CHARS_PER_FRAME, target.length);
        displayedLenRef.current = nextLen;
        setDisplayedText(target.slice(0, nextLen));
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [instant]);

  return {
    bufferedText,
    displayedText,
    start,
    appendBuffer,
    markStreamEnded,
    snapToBuffer,
    waitForCatchUp,
    reset,
  };
}
