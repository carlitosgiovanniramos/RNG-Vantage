import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#111c2d] text-white">
      <div className="container mx-auto px-4 py-8 sm:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
        {/* Brand or Copyright */}
        <p className="text-xs font-medium tracking-wide uppercase text-gray-400">
          © 2026 RNG-VANTAGE. ALL RIGHTS RESERVED.
        </p>

        {/* Legal Links */}
        <nav className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs font-medium tracking-wide text-gray-400 uppercase">
          <Link
            href="/politica-privacidad"
            className="hover:text-white transition-colors"
          >
            POLÍTICA DE PRIVACIDAD
          </Link>
          <Link
            href="/terminos"
            className="hover:text-white transition-colors"
          >
            TÉRMINOS DE SERVICIO
          </Link>
          <Link
            href="/aviso-legal"
            className="hover:text-white transition-colors"
          >
            AVISO LEGAL
          </Link>
        </nav>
      </div>
    </footer>
  );
}
