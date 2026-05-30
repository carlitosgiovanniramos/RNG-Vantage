"use client";

import { useEffect } from "react";
import { Instagram } from "lucide-react";

/**
 * Feed de Instagram usando el método NATIVO (oficial y gratuito).
 *
 * Cada post se incrusta con un <blockquote class="instagram-media"> y el
 * script `embed.js` de Instagram lo convierte en la tarjeta del post.
 *
 * Para agregar/cambiar posts: copia el enlace del post desde Instagram
 * (botón ··· → "Copiar enlace") y pégalo en el array POSTS de page.tsx.
 * Nota: no se actualiza solo; al subir un post nuevo hay que añadir su URL.
 */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SCRIPT = "https://www.instagram.com/embed.js";
const PROFILE_URL = "https://www.instagram.com/rgl.estudio/";

export function InstagramFeed({ posts }: { posts: string[] }) {
  useEffect(() => {
    if (posts.length === 0) return;

    const existing = document.querySelector(`script[src="${EMBED_SCRIPT}"]`);
    if (!existing) {
      const script = document.createElement("script");
      script.src = EMBED_SCRIPT;
      script.async = true;
      script.onload = () => window.instgrm?.Embeds?.process();
      document.body.appendChild(script);
    } else {
      // El script ya está cargado: reprocesar para renderizar los posts.
      window.instgrm?.Embeds?.process();
    }
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="border border-dashed border-border/60 bg-muted/30 px-8 py-16 text-center">
        <Instagram className="mx-auto mb-4 size-12 text-primary/50" />
        <p className="font-spaceGrotesk text-lg font-bold uppercase tracking-tight text-foreground">
          Síguenos en Instagram
        </p>
        <p className="mx-auto mt-2 max-w-md font-workSans text-sm text-muted-foreground">
          Mira nuestros trabajos más recientes y descubre cómo ayudamos a las
          marcas a crecer.
        </p>
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-12 items-center gap-2 bg-primary px-6 font-spaceGrotesk text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary/85"
        >
          <Instagram className="size-4" />
          Ver en Instagram
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((url) => (
          <div
            key={url}
            className="group relative overflow-hidden border border-border/60 bg-card p-2 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary hover:shadow-[10px_10px_0_rgba(148,163,153,0.35)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
            />
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{ width: "100%", margin: 0, minWidth: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center gap-2 border border-foreground px-6 font-spaceGrotesk text-xs font-black uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <Instagram className="size-4" />
          Ver más en Instagram
        </a>
      </div>
    </div>
  );
}
