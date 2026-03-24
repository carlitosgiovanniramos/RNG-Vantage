import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-spaceGrotesk text-2xl font-bold tracking-tighter uppercase text-foreground">
            RNG-Vantage
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center font-medium">
          <Link
            href="/catalogo"
            className="transition-colors hover:text-primary text-foreground"
          >
            Servicios
          </Link>
          <Link
            href="/reservar"
            className="transition-colors hover:text-primary text-foreground"
          >
            Reservar
          </Link>
          <Link
            href="/login"
            className="transition-colors hover:text-primary text-foreground"
          >
            Iniciar Sesión
          </Link>

          {/* Authentication Action - Primary CTA */}
          <Link href="/register">
            <Button
              variant="default"
              className="rounded-none bg-[#ae2900] hover:bg-[#851e00] text-white font-bold"
            >
              Comenzar
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger 
              render={<Button variant="ghost" size="icon" className="md:hidden" />}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              {/* Added accessible title for visually impaired users */}
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <nav className="flex flex-col gap-6 mt-10">
                <Link
                  href="/catalogo"
                  className="text-lg font-medium hover:text-primary"
                >
                  Servicios
                </Link>
                <Link
                  href="/reservar"
                  className="text-lg font-medium hover:text-primary"
                >
                  Reservar
                </Link>
                <Link
                  href="/login"
                  className="text-lg font-medium hover:text-primary"
                >
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="mt-4">
                  <Button className="w-full rounded-none bg-[#ae2900] hover:bg-[#851e00] text-white font-bold">
                    Comenzar
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
