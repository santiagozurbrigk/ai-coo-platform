"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CHARS_PER_FRAME = 3;
const DRAIN_TIMEOUT_MS = 2000;

export function useStreamTypewriter(opts: { instant?: boolean }) {
  const instant = opts.instant ?? false;
  const [bufferedText, setBufferedText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const bufferedRef = useRef("");
  const displayedLenRef = useRef(0);
  const streamEndedRef = useRef(false);
  const streamEndedAtRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  const syncDisplayed = useCallback((text: string) => {
    displayedLenRef.current = text.length;
    setDisplayedText(text);
  }, []);

  const reset = useCallback(() => {
    bufferedRef.current = "";
    displayedLenRef.current = 0;
    streamEndedRef.current = false;
    streamEndedAtRef.current = null;
    activeRef.current = false;
    setBufferedText("");
    setDisplayedText("");
  }, []);

  const start = useCallback(() => {
    bufferedRef.current = "";
    displayedLenRef.current = 0;
    streamEndedRef.current = false;
    streamEndedAtRef.current = null;
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
    streamEndedAtRef.current = Date.now();
  }, []);

  const snapToBuffer = useCallback(() => {
    syncDisplayed(bufferedRef.current);
  }, [syncDisplayed]);

  const getTextSnapshot = useCallback(() => {
    const buffered = bufferedRef.current;
    return {
      buffered,
      displayed: buffered.slice(0, displayedLenRef.current),
    };
  }, []);

  const waitForCatchUp = useCallback((): Promise<void> => {
    if (instant) return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => {
        const buffered = bufferedRef.current;
        if (displayedLenRef.current >= buffered.length) {
          resolve();
          return;
        }

        const endedAt = streamEndedAtRef.current;
        if (
          streamEndedRef.current &&
          endedAt !== null &&
          Date.now() - endedAt >= DRAIN_TIMEOUT_MS
        ) {
          syncDisplayed(buffered);
          resolve();
          return;
        }

        requestAnimationFrame(check);
      };
      check();
    });
  }, [instant, syncDisplayed]);

  useEffect(() => {
    if (instant) return;

    let raf = 0;
    const tick = () => {
      // El loop debe seguir vivo siempre; solo avanza cuando está activo.
      // (No hacer `return` temprano: eso mataría el RAF y el texto aparecería de golpe.)
      if (activeRef.current) {
        const target = bufferedRef.current;
        const currentLen = displayedLenRef.current;
        if (currentLen < target.length) {
          const nextLen = Math.min(currentLen + CHARS_PER_FRAME, target.length);
          displayedLenRef.current = nextLen;
          setDisplayedText(target.slice(0, nextLen));
        }
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
    getTextSnapshot,
    reset,
  };
}
