import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#2c2f2e] dark:bg-[#f5f7f5] text-[#f5f7f5] dark:text-[#2c2f2e]">
      <div className="container mx-auto px-4 py-8 sm:px-8 flex flex-col items-center justify-between gap-6 md:flex-row">
        {/* Brand or Copyright */}
        <p className="font-spaceGrotesk text-xs tracking-widest uppercase opacity-80">
          © 2026 RNG-VANTAGE. ALL RIGHTS RESERVED.
        </p>

        {/* Legal Links */}
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-8 font-spaceGrotesk text-xs tracking-widest uppercase opacity-80">
          <Link
            href="/politica-privacidad"
            className="hover:text-[#ff7855] dark:hover:text-[#ae2900] transition-colors"
          >
            POLÍTICA DE PRIVACIDAD
          </Link>
          <Link
            href="/terminos"
            className="hover:text-[#ff7855] dark:hover:text-[#ae2900] transition-colors"
          >
            TÉRMINOS DE SERVICIO
          </Link>
          <Link
            href="/seguridad"
            className="hover:text-[#ff7855] dark:hover:text-[#ae2900] transition-colors"
          >
            SEGURIDAD
          </Link>
          <Link
            href="/estado"
            className="hover:text-[#ff7855] dark:hover:text-[#ae2900] transition-colors"
          >
            ESTADO
          </Link>
        </nav>
      </div>
    </footer>
  );
}
