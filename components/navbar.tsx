"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { useSupabase } from "@/hooks/use-supabase";

const navLinks = [
  { href: "/catalogo", label: "Servicios" },
  { href: "/capacitacion", label: "Capacitación" },
  { href: "/reservar", label: "Reservar" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const supabase = useSupabase();
  const isHome = pathname === "/";
  const hasHero = isHome || pathname === "/catalogo" || pathname === "/capacitacion";

  useEffect(() => {
    if (!hasHero) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasHero]);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setDisplayName("");
        return;
      }

      setIsAuthenticated(true);

      const metadataFullName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name.trim()
          : "";
      const metadataFirstName =
        typeof user.user_metadata?.first_name === "string"
          ? user.user_metadata.first_name.trim()
          : "";
      const metadataLastName =
        typeof user.user_metadata?.last_name === "string"
          ? user.user_metadata.last_name.trim()
          : "";
      const metadataName =
        metadataFullName || `${metadataFirstName} ${metadataLastName}`.trim();

      setDisplayName(metadataName || user.email?.split("@")[0] || "Usuario");

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name,last_name,role")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted || !profile) return;

      const profileName =
        `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
      if (profileName) {
        setDisplayName(profileName);
      }
      setIsAdmin(profile.role === "admin");
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const accountHref = isAdmin ? "/dashboard" : "/perfil";

  const transparent = hasHero && !scrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${transparent ? "bg-transparent" : "bg-background"}`}>
      <div className="mx-auto flex w-full max-w-360 items-center justify-between px-8 py-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo-rng.webp"
            alt="RGL Estudio Logo"
            width={42}
            height={42}
            className="rounded-none"
          />
          <span className={`font-spaceGrotesk text-2xl font-black tracking-tighter uppercase transition-colors duration-300 ${transparent ? "text-white" : "text-foreground"}`}>
            RGL Estudio
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`font-spaceGrotesk text-base font-black tracking-wide uppercase transition-colors duration-200 ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : transparent
                      ? "text-white hover:text-white/80"
                      : "text-foreground/80 hover:text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* CTA + Mobile Menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href={accountHref}>
                <Button
                  variant="outline"
                  className={`h-auto rounded-none font-spaceGrotesk font-bold text-sm px-4 py-2 transition-colors duration-300 ${transparent ? "border-white text-white bg-transparent hover:bg-white hover:text-foreground" : ""}`}
                >
                  {displayName}
                </Button>
              </Link>
              <form action={logout}>
                <Button
                  type="submit"
                  variant="default"
                  className="h-auto rounded-none bg-primary hover:bg-primary/85 text-primary-foreground font-spaceGrotesk font-bold text-sm px-6 py-3"
                >
                  Cerrar sesión
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="outline"
                  className={`h-auto rounded-none font-spaceGrotesk font-bold text-sm px-4 py-2 transition-colors duration-300 ${transparent ? "border-white text-white bg-transparent hover:bg-white hover:text-foreground" : ""}`}
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="default"
                  className="h-auto rounded-none bg-primary hover:bg-primary/85 text-primary-foreground font-spaceGrotesk font-bold text-sm px-6 py-3"
                >
                  Comenzar
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className={`md:hidden ${transparent ? "text-white hover:bg-white/20 hover:text-white" : ""}`} />
                }
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú de navegación</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] p-0 sm:max-w-sm">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>

                {/* Logo en el panel */}
                <div className="px-8 pt-8 pb-6 flex items-center gap-3">
                  <Image
                    src="/images/logo-rng.webp"
                    alt="RGL Estudio Logo"
                    width={28}
                    height={28}
                    className="rounded-none"
                  />
                  <span className="font-spaceGrotesk text-xl font-black tracking-tighter uppercase text-foreground">
                    RGL Estudio
                  </span>
                </div>
                <div className="h-px w-full bg-border" />

                {/* Links */}
                <nav className="flex flex-col px-8 pt-8">
                  {navLinks.map(({ href, label }) => {
                    const isActive =
                      pathname === href || pathname.startsWith(href + "/");
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`font-spaceGrotesk text-lg font-bold tracking-tight transition-colors py-4 border-b border-border ${
                          isActive
                            ? "text-primary"
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}

                  {isAuthenticated ? (
                    <>
                      <Link
                        href={accountHref}
                        onClick={() => setOpen(false)}
                        className="font-spaceGrotesk text-lg font-bold tracking-tight transition-colors py-4 border-b border-border text-foreground hover:text-primary"
                      >
                        {displayName}
                      </Link>

                      <form action={logout} className="mt-8">
                        <Button
                          type="submit"
                          className="h-auto w-full rounded-none bg-primary hover:bg-primary/85 text-primary-foreground font-spaceGrotesk font-bold text-base px-6 py-4"
                        >
                          Cerrar sesión
                        </Button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="font-spaceGrotesk text-lg font-bold tracking-tight transition-colors py-4 border-b border-border text-foreground hover:text-primary"
                      >
                        Iniciar sesión
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setOpen(false)}
                        className="mt-8"
                      >
                        <Button className="h-auto w-full rounded-none bg-primary hover:bg-primary/85 text-primary-foreground font-spaceGrotesk font-bold text-base px-6 py-4">
                          Comenzar
                        </Button>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {!transparent && <div className="h-px w-full bg-[#dadedb] dark:bg-[#3d4140]" />}
    </header>
  );
}
