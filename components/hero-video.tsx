"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLanguage } from "./language-provider";

/** Fade to black between plays; animation frames and timers are canceled on unmount. */
export function HeroVideo() {
  const { t } = useLanguage();
  const ref = useRef<HTMLVideoElement>(null);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadingOut = useRef(false);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    function fade(to: number) {
      cancelAnimationFrame(frame.current);
      const from = Number(video!.style.opacity || 0);
      const start = performance.now();
      function step(now: number) {
        const progress = Math.min((now - start) / 500, 1);
        video!.style.opacity = String(from + (to - from) * progress);
        if (progress < 1) frame.current = requestAnimationFrame(step);
      }
      frame.current = requestAnimationFrame(step);
    }
    async function start() {
      if (reduced.matches || userPaused.current) return;
      try {
        await video!.play();
        fade(1);
        setPaused(false);
      } catch {
        setPaused(true);
      }
    }
    function update() {
      if (video!.duration - video!.currentTime <= 0.55 && !fadingOut.current) {
        fadingOut.current = true;
        fade(0);
      }
    }
    function ended() {
      cancelAnimationFrame(frame.current);
      video!.style.opacity = "0";
      timer.current = setTimeout(() => {
        video!.currentTime = 0;
        fadingOut.current = false;
        void start();
      }, 100);
    }
    function preference() {
      if (reduced.matches) {
        video!.pause();
        setPaused(true);
      } else void start();
    }
    video.addEventListener("canplay", start);
    video.addEventListener("timeupdate", update);
    video.addEventListener("ended", ended);
    reduced.addEventListener("change", preference);
    if (reduced.matches) {
      video.pause();
      setPaused(true);
    } else if (video.readyState >= 3) void start();
    return () => {
      cancelAnimationFrame(frame.current);
      if (timer.current) clearTimeout(timer.current);
      video.removeEventListener("canplay", start);
      video.removeEventListener("timeupdate", update);
      video.removeEventListener("ended", ended);
      reduced.removeEventListener("change", preference);
      video.pause();
    };
  }, []);

  async function toggle() {
    const video = ref.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      userPaused.current = true;
      setPaused(true);
    } else {
      try {
        userPaused.current = false;
        await video.play();
        video.style.opacity = "1";
        setPaused(false);
      } catch {
        setPaused(true);
      }
    }
  }

  return (
    <>
      <video
        ref={ref}
        className="hero-video"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source
          src="https://img.aisaasgo.org/landing/11.mp4"
          type="video/mp4"
        />
      </video>
      <button
        className="video-control liquid-glass icon-button"
        onClick={toggle}
        aria-label={
          paused
            ? t("播放背景视频", "Play background video")
            : t("暂停背景视频", "Pause background video")
        }
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>
    </>
  );
}
