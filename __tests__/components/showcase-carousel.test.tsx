import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ShowcaseCarousel, type ShowcaseItem } from "@/components/showcase-carousel";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" src={String(props.src)} />,
}));

const items: ShowcaseItem[] = ["Redes", "Video", "Foto"].map((title) => ({
  title,
  description: `Descripción de ${title}`,
  image: `/images/${title}.webp`,
  href: `#${title}`,
}));

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function activeDot() {
  return screen.getAllByRole("button", { name: /^Ir a / }).find((dot) => dot.getAttribute("aria-current") === "true")
    ?.getAttribute("aria-label");
}

function click(name: "Siguiente" | "Anterior") {
  fireEvent.click(screen.getByRole("button", { name }));
  // Sin layout en jsdom no hay transitionend: cierra el deslizamiento el respaldo.
  act(() => {
    vi.advanceTimersByTime(1100);
  });
}

describe("ShowcaseCarousel", () => {
  it("avanza una tarjeta por clic y sigue en bucle sin rebobinar", () => {
    render(<ShowcaseCarousel items={items} />);
    expect(activeDot()).toBe("Ir a Redes");

    const sequence = [];
    for (let i = 0; i < 7; i++) {
      click("Siguiente");
      sequence.push(activeDot());
    }
    expect(sequence).toEqual([
      "Ir a Video",
      "Ir a Foto",
      "Ir a Redes",
      "Ir a Video",
      "Ir a Foto",
      "Ir a Redes",
      "Ir a Video",
    ]);
  });

  it("retrocede en bucle desde la primera tarjeta", () => {
    render(<ShowcaseCarousel items={items} />);
    click("Anterior");
    expect(activeDot()).toBe("Ir a Foto");
    click("Anterior");
    expect(activeDot()).toBe("Ir a Video");
  });

  it("solo la copia central es accesible para lectores de pantalla y teclado", () => {
    render(<ShowcaseCarousel items={items} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(items.length);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["#Redes", "#Video", "#Foto"]);
  });
});
