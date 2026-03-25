import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="flex items-center justify-between w-full px-8 py-6 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-spaceGrotesk text-2xl font-black tracking-tighter uppercase text-foreground">
            RNG-Vantage
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/catalogo"
            className="font-spaceGrotesk text-sm font-bold tracking-tight text-primary border-b-2 border-primary pb-1 transition-colors duration-200"
          >
            Servicios
          </Link>
          <Link
            href="/reservar"
            className="font-spaceGrotesk text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors duration-200"
          >
            Reservar
          </Link>
          <Link
            href="/login"
            className="font-spaceGrotesk text-sm font-bold tracking-tight text-foreground/80 hover:text-primary transition-colors duration-200"
          >
            Iniciar Sesión
          </Link>
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
            <Sheet>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="md:hidden" />}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <nav className="flex flex-col gap-6 mt-10">
                  <Link
                    href="/catalogo"
                    className="font-spaceGrotesk text-lg font-bold tracking-tight hover:text-primary transition-colors"
                  >
                    Servicios
                  </Link>
                  <Link
                    href="/reservar"
                    className="font-spaceGrotesk text-lg font-bold tracking-tight hover:text-primary transition-colors"
                  >
                    Reservar
                  </Link>
                  <Link
                    href="/login"
                    className="font-spaceGrotesk text-lg font-bold tracking-tight hover:text-primary transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" className="mt-4">
                    <Button className="w-full rounded-none bg-primary hover:bg-primary/85 text-primary-foreground font-spaceGrotesk font-bold">
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
