import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const TAGLINE_WORDS = ["Le", "fret", "à", "portée", "de", "main."];
const HOLD_MS = 2200;
const FADE_MS = 400;

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), HOLD_MS);
    const finishTimer = setTimeout(onFinish, HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0B2A4A] transition-opacity ease-out ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="flex flex-col items-center gap-4 animate-splash-logo">
        <Logo className="h-20 w-20" />
        <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
          SEEDO<span className="text-[#FF7A00]">FRET</span>
        </h1>
      </div>

      <p className="absolute bottom-16 flex gap-1.5 text-sm font-medium text-white/80" style={{ fontFamily: "Inter, sans-serif" }}>
        {TAGLINE_WORDS.map((word, i) => (
          <span
            key={i}
            className="inline-block opacity-0 animate-word-reveal"
            style={{ animationDelay: `${0.6 + i * 0.12}s` }}
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  );
}
