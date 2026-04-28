import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#2c2f2e] dark:bg-[#f5f7f5] text-[#f5f7f5] dark:text-[#2c2f2e]">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-[1440px] mx-auto px-8 py-12 gap-8 md:gap-0">
        {/* Logo */}
        <div className="font-spaceGrotesk text-lg font-black uppercase tracking-widest">
          RGL Estudio
        </div>

        {/* Legal Links */}
        <nav className="flex flex-wrap justify-center gap-8 font-spaceGrotesk text-xs tracking-widest uppercase text-border opacity-60">
          <Link
            href="/politica-privacidad"
            className="hover:text-[#ff7855] dark:hover:text-[#ae2900] hover:opacity-100 transition-all"
          >
            Política de Privacidad
          </Link>
          {/* TODO: Crear páginas para estas rutas cuando se implementen */}
          <Link
            href="#"
            className="hover:text-[#ff7855] dark:hover:text-[#ae2900] hover:opacity-100 transition-all"
          >
            Términos de Servicio
          </Link>
          <Link
            href="#"
            className="hover:text-[#ff7855] dark:hover:text-[#ae2900] hover:opacity-100 transition-all"
          >
            Seguridad
          </Link>
          <Link
            href="#"
            className="hover:text-[#ff7855] dark:hover:text-[#ae2900] hover:opacity-100 transition-all"
          >
            Estado
          </Link>
        </nav>

        {/* Copyright */}
        <div className="font-spaceGrotesk text-xs tracking-widest uppercase opacity-60">
          © 2026 RGL Estudio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
