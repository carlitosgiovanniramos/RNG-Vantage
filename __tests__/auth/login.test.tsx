import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import { login, resendSignupConfirmation, signup } from "@/app/(auth)/actions";

const navigation = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
vi.mock("@/app/(auth)/actions", () => ({
  login: vi.fn(),
  resendSignupConfirmation: vi.fn(),
  signup: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  navigation.query = "registered=1&email=cliente%40example.com";
});

describe("Compact registration", () => {
  it("keeps labels and blocks invalid registration without sending data", async () => {
    const { container } = render(<RegisterPage />);
    expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
    expect(container.querySelectorAll("input[placeholder]")).toHaveLength(0);
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("autocomplete", "given-name");
    expect(screen.getByLabelText("Apellido")).toHaveAttribute("autocomplete", "family-name");
    fireEvent.submit(screen.getByRole("button", { name: "Registrarse" }).closest("form")!);
    await screen.findByText("El nombre debe tener al menos 2 caracteres");
    expect(screen.getByText("Debes aceptar la política de tratamiento de datos (LOPDP)")).toBeInTheDocument();
    expect(signup).not.toHaveBeenCalled();
  });
});
afterEach(cleanup);

describe("Login confirmation feedback", () => {
  it("replaces the registration success with a single login error", async () => {
    vi.mocked(login).mockResolvedValue({
      error: "Debes confirmar tu correo electrónico antes de iniciar sesión.",
      values: { email: "cliente@example.com" },
    });
    render(<LoginPage />);
    expect(screen.getByRole("status")).toHaveTextContent("Cuenta creada");
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("cliente@example.com");

    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "Example123!" } });
    fireEvent.submit(screen.getByRole("button", { name: "Ingresar" }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Debes confirmar tu correo"));
    expect(screen.queryByText(/Cuenta creada/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("opens a dialog with the current email and keeps resend errors inside it", async () => {
    vi.mocked(resendSignupConfirmation).mockResolvedValue({
      error: "Espera unos minutos antes de volver a intentarlo.",
      success: "",
      values: { email: "otro@example.com" },
    });
    render(<LoginPage />);
    expect(screen.queryByRole("button", { name: "Reenviar confirmación" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "otro@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "¿No te llegó el correo de confirmación?" }));

    const dialog = await screen.findByRole("dialog", { name: "Confirma tu correo" });
    expect(within(dialog).getByLabelText("Correo electrónico")).toHaveValue("otro@example.com");
    fireEvent.submit(within(dialog).getByRole("button", { name: "Reenviar confirmación" }).closest("form")!);

    await waitFor(() => expect(within(dialog).getByRole("alert")).toHaveTextContent("Espera unos minutos"));
    expect(resendSignupConfirmation).toHaveBeenCalledTimes(1);
    fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("Cuenta creada");
  });

  it("shows resend success in the modal and refreshes the email on reopening", async () => {
    vi.mocked(resendSignupConfirmation).mockResolvedValue({
      error: "",
      success: "Te enviamos un nuevo correo de confirmación.",
      values: { email: "cliente@example.com" },
    });
    render(<LoginPage />);
    const help = screen.getByRole("button", { name: "¿No te llegó el correo de confirmación?" });
    fireEvent.click(help);
    const dialog = await screen.findByRole("dialog");
    fireEvent.submit(within(dialog).getByRole("button", { name: "Reenviar confirmación" }).closest("form")!);
    await waitFor(() => expect(within(dialog).getByRole("status")).toHaveTextContent("Te enviamos un nuevo correo"));
    expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "nuevo@example.com" } });
    fireEvent.click(help);
    const reopened = await screen.findByRole("dialog");
    expect(within(reopened).getByLabelText("Correo electrónico")).toHaveValue("nuevo@example.com");
    expect(within(reopened).queryByRole("status")).not.toBeInTheDocument();
  });
});
