"use client";

import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const AuthNavigation = createContext<((href: string) => void) | null>(null);

export function AuthCard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const cardRef = useRef<HTMLElement>(null);
  const destinationRef = useRef<string | null>(null);
  const animationRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    return () => {
      animationRef.current?.cancel();
      if (card) card.inert = false;
      destinationRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (destinationRef.current !== pathname || !cardRef.current) return;
    destinationRef.current = null;
    animationRef.current?.cancel();
    const card = cardRef.current;
    card.inert = false;
    const incoming = card.animate(
      [{ transform: "rotateY(-90deg)", opacity: 0.35 }, { transform: "rotateY(0deg)", opacity: 1 }],
      { duration: 220, easing: "ease-out" },
    );
    animationRef.current = incoming;
    const heading = card.querySelector("h1");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    return () => incoming.cancel();
  }, [pathname]);

  async function navigate(href: string) {
    if (destinationRef.current || href === pathname) return;
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href, { scroll: false });
      return;
    }
    destinationRef.current = href;
    router.prefetch(href);
    card.inert = true;
    const outgoing = card.animate(
      [{ transform: "rotateY(0deg)", opacity: 1 }, { transform: "rotateY(90deg)", opacity: 0.35 }],
      { duration: 180, easing: "ease-in", fill: "forwards" },
    );
    animationRef.current = outgoing;
    try {
      await outgoing.finished;
      router.push(href, { scroll: false });
    } catch {
      card.inert = false;
      destinationRef.current = null;
    }
  }

  return (
    <AuthNavigation.Provider value={navigate}>
      <main
        ref={cardRef}
        className="relative w-full bg-card/95 p-7 shadow-[0_24px_80px_-32px_rgba(44,47,46,0.22)] backdrop-blur-xl [backface-visibility:hidden] sm:p-9"
      >
        <div aria-hidden="true" className="absolute left-7 top-0 h-[3px] w-12 bg-primary sm:left-9" />
        {children}
      </main>
    </AuthNavigation.Provider>
  );
}

export function AuthSwitchLink({ href, children }: { href: string; children: ReactNode }) {
  const navigate = useContext(AuthNavigation);
  return (
    <Link
      href={href}
      className="font-semibold text-primary decoration-primary/30 underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      onNavigate={navigate ? (event) => {
        event.preventDefault();
        navigate(href);
      } : undefined}
    >
      {children}
    </Link>
  );
}
