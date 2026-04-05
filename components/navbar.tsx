"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navLinks = [
  { href: "/catalogo", label: "Servicios" },
  { href: "/reservar", label: "Reservar" },
  { href: "/login", label: "Iniciar Sesión" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="flex items-center justify-between w-full px-8 py-6 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo-rng.webp"
            alt="RGL Estudio Logo"
            width={42}
            height={42}
            className="rounded-none"
          />
          <span className="font-spaceGrotesk text-2xl font-black tracking-tighter uppercase text-foreground">
            RGL Estudio
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`font-spaceGrotesk text-sm font-bold tracking-tight transition-colors duration-200 ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
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
          <Link href="/register" className="hidden md:block">
            <Button
              variant="default"
              className="h-auto rounded-none bg-primary hover:bg-primary/85 text-primary-foreground font-spaceGrotesk font-bold text-sm px-6 py-3"
            >
              Comenzar
            </Button>
          </Link>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden" />}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú de navegación</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
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
                <div className="h-[1px] w-full bg-border" />

                {/* Links */}
                <nav className="flex flex-col px-8 pt-8">
                  {navLinks.map(({ href, label }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`font-spaceGrotesk text-lg font-bold tracking-tight transition-colors py-4 border-b border-border ${
                          isActive ? "text-primary" : "text-foreground hover:text-primary"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}

                  {/* CTA */}
                  <Link href="/register" onClick={() => setOpen(false)} className="mt-8">
                    <Button className="h-auto w-full rounded-none bg-primary hover:bg-primary/85 text-primary-foreground font-spaceGrotesk font-bold text-base px-6 py-4">
                      Comenzar
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {/* Separador sutil — bloque de color, no border (design system rule) */}
      <div className="h-[1px] w-full bg-[#dadedb] dark:bg-[#3d4140]" />
    </header>
  );
}
