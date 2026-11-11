import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ServiceDeck } from "@/components/service-deck";
import type { PublicService } from "@/lib/services";

const services: PublicService[] = ["Inicial", "Standard", "Premium"].map((plan, i) => ({
  id: `id-${i}`,
  name: `Redes Sociales - Paquete ${plan}`,
  description: `Incluye: item ${plan} uno, item ${plan} dos, item ${plan} tres.`,
  type: "manejo_redes",
  price: 100 * (i + 1),
  duration_months: 1,
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
})) as PublicService[];

afterEach(cleanup);

/** Nombre del servicio al frente: el único panel sin aria-hidden. */
function frontName() {
  const headings = screen.getAllByRole("heading", { level: 3 });
  return headings.map((h) => h.textContent);
}

/** Contador de arriba: "Servicio N de total". */
function counter() {
  return screen.getByLabelText(/^Servicio \d+ de \d+$/).getAttribute("aria-label");
}

describe("ServiceDeck", () => {
  it("empieza en el plan destacado y solo muestra su contenido", () => {
    render(<ServiceDeck services={services} featuredIndex={1} />);
    expect(counter()).toBe("Servicio 2 de 3");
    expect(frontName()).toEqual(["Standard"]);
    expect(screen.getByText("Más popular")).toBeInTheDocument();
  });

  it("trae al frente la tarjeta de atrás que se toca y da la vuelta", () => {
    const { container } = render(<ServiceDeck services={services} featuredIndex={1} />);
    const sideCard = (title: string) =>
      container.querySelector<HTMLElement>(`[title="Ver ${title}"]`);

    fireEvent.click(sideCard("Premium")!);
    expect(frontName()).toEqual(["Premium"]);

    // Desde Premium, Inicial queda a la derecha: el mazo da la vuelta.
    fireEvent.click(sideCard("Inicial")!);
    expect(frontName()).toEqual(["Inicial"]);
    expect(counter()).toBe("Servicio 1 de 3");
  });

  it("las flechas recorren los servicios en bucle", () => {
    render(<ServiceDeck services={services} featuredIndex={1} />);
    const next = screen.getByRole("button", { name: "Servicio siguiente" });
    const prev = screen.getByRole("button", { name: "Servicio anterior" });

    fireEvent.click(next);
    expect(frontName()).toEqual(["Premium"]);
    fireEvent.click(next);
    expect(frontName()).toEqual(["Inicial"]);
    fireEvent.click(prev);
    expect(frontName()).toEqual(["Premium"]);
  });

  it("con 2 servicios asoma una tarjeta a cada lado y el contador marca el total", () => {
    const { container } = render(<ServiceDeck services={services.slice(0, 2)} />);
    expect(frontName()).toEqual(["Inicial"]);
    expect(counter()).toBe("Servicio 1 de 2");
    // El otro servicio asoma a ambos lados del mazo.
    expect(container.querySelectorAll('[title="Ver Standard"]')).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Servicio siguiente" }));
    expect(frontName()).toEqual(["Standard"]);
    expect(counter()).toBe("Servicio 2 de 2");
    fireEvent.click(screen.getByRole("button", { name: "Servicio siguiente" }));
    expect(frontName()).toEqual(["Inicial"]);
  });

  it("las tarjetas de atrás no bloquean el clic (el inert va solo en su contenido)", () => {
    const { container } = render(<ServiceDeck services={services} featuredIndex={1} />);
    const side = container.querySelector<HTMLElement>('[title="Ver Premium"]')!;
    expect(side.hasAttribute("inert")).toBe(false);
    expect(side.firstElementChild?.hasAttribute("inert")).toBe(true);
  });
});
