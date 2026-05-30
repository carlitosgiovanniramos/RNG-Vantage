import Link from "next/link";
import { Facebook, Instagram, ExternalLink, LinkIcon } from "lucide-react";

/** Icono de TikTok (no incluido en lucide-react). */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12v-3.2a5.78 5.78 0 0 0-.78-.05A5.79 5.79 0 1 0 15.66 15.4V9.01a7.35 7.35 0 0 0 4.34 1.39V7.31a4.28 4.28 0 0 1-3.4-1.49z" />
    </svg>
  );
}

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/rgl.estudio/",
    Icon: Instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@rutynoemigo7",
    Icon: TikTokIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/rutynoemigo",
    Icon: Facebook,
  },
] as const;

const NAV_LINKS = [
  { href: "/catalogo", label: "Servicios" },
  { href: "/capacitacion", label: "Capacitación" },
  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  { href: "/reservar", label: "Reservar" },
];

const LEGAL_LINKS = [
  { href: "/politica-privacidad", label: "Política de Privacidad" },
  { href: "/terminos-servicio", label: "Términos de Servicio" },
];

const EXTERNAL_LINKS = [
  {
    href: "https://rutynoemigo.my.canva.site/portafolio-creativo",
    label: "Portafolio creativo",
    Icon: ExternalLink,
  },
  {
    href: "https://linktr.ee/rutynoemigo",
    label: "Todos mis enlaces",
    Icon: LinkIcon,
  },
];

const linkClass =
  "hover:text-[#ff7855] dark:hover:text-[#ae2900] hover:opacity-100 opacity-70 transition-all";

export function Footer() {
  return (
    <footer className="w-full bg-[#2c2f2e] text-[#f5f7f5] dark:bg-[#f5f7f5] dark:text-[#2c2f2e]">
      <div className="mx-auto w-full max-w-[1440px] px-8 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca + redes */}
          <div className="space-y-4">
            <div className="font-spaceGrotesk text-lg font-black uppercase tracking-widest">
              RGL Estudio
            </div>
            <p className="max-w-xs font-workSans text-sm opacity-70">
              Marketing digital con reservas, ventas y control financiero en un
              solo lugar.
            </p>
            <div className="flex gap-2 pt-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center border border-[#f5f7f5]/20 transition-colors hover:border-[#ff7855] hover:bg-[#ff7855] hover:text-[#2c2f2e] dark:border-[#2c2f2e]/20 dark:hover:border-[#ae2900] dark:hover:bg-[#ae2900] dark:hover:text-[#f5f7f5]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className="space-y-3">
            <h3 className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] opacity-50">
              Navegación
            </h3>
            <ul className="space-y-2 font-spaceGrotesk text-xs uppercase tracking-widest">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces externos */}
          <div className="space-y-3">
            <h3 className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] opacity-50">
              Enlaces
            </h3>
            <ul className="space-y-2 font-spaceGrotesk text-xs uppercase tracking-widest">
              {EXTERNAL_LINKS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 ${linkClass}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.18em] opacity-50">
              Legal
            </h3>
            <ul className="space-y-2 font-spaceGrotesk text-xs uppercase tracking-widest">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#f5f7f5]/10 pt-6 font-spaceGrotesk text-xs uppercase tracking-widest opacity-60 dark:border-[#2c2f2e]/10 sm:flex-row">
          <span>© 2026 RGL Estudio. Todos los derechos reservados.</span>
          <span>Hecho con dedicación en Ecuador 🇪🇨</span>
        </div>
      </div>
    </footer>
  );
}
