import { describe, it, expect } from "vitest";
import {
  kushkiCardChargeSchema,
  kushkiTransferInitSchema,
  kushkiWebhookSchema,
} from "@/lib/validators/payment";

describe("kushkiCardChargeSchema", () => {
  it("acepta datos validos", () => {
    const result = kushkiCardChargeSchema.safeParse({
      service_id: "123e4567-e89b-12d3-a456-426614174000",
      auto_renew: true,
      token: "tok_abc123",
    });
    expect(result.success).toBe(true);
  });

  it("aplica false por defecto a auto_renew", () => {
    const result = kushkiCardChargeSchema.safeParse({
      service_id: "123e4567-e89b-12d3-a456-426614174000",
      token: "tok_abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.auto_renew).toBe(false);
    }
  });

  it("rechaza service_id que no es uuid", () => {
    const result = kushkiCardChargeSchema.safeParse({
      service_id: "no-es-uuid",
      auto_renew: false,
      token: "tok_abc123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza token vacio", () => {
    const result = kushkiCardChargeSchema.safeParse({
      service_id: "123e4567-e89b-12d3-a456-426614174000",
      auto_renew: false,
      token: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("kushkiTransferInitSchema", () => {
  const validInput = {
    service_id: "123e4567-e89b-12d3-a456-426614174000",
    auto_renew: false,
    document_type: "CC",
    document_id: "1712345678",
    email: "cliente@correo.com",
  };

  it("acepta datos validos", () => {
    expect(kushkiTransferInitSchema.safeParse(validInput).success).toBe(true);
  });

  it("rechaza tipo de documento invalido", () => {
    const result = kushkiTransferInitSchema.safeParse({
      ...validInput,
      document_type: "XX",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza documento demasiado corto", () => {
    const result = kushkiTransferInitSchema.safeParse({
      ...validInput,
      document_id: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza correo invalido", () => {
    const result = kushkiTransferInitSchema.safeParse({
      ...validInput,
      email: "no-es-correo",
    });
    expect(result.success).toBe(false);
  });
});

describe("kushkiWebhookSchema", () => {
  it("acepta un evento valido minimo", () => {
    const result = kushkiWebhookSchema.safeParse({
      transactionId: "txn-123",
      status: "APPROVAL",
    });
    expect(result.success).toBe(true);
  });

  it("descarta campos extra sin fallar", () => {
    const result = kushkiWebhookSchema.safeParse({
      transactionId: "txn-123",
      status: "APPROVAL",
      campoDesconocido: "valor",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("campoDesconocido" in result.data).toBe(false);
    }
  });

  it("rechaza un status fuera del enum", () => {
    const result = kushkiWebhookSchema.safeParse({
      transactionId: "txn-123",
      status: "UNKNOWN",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza un evento sin transactionId", () => {
    const result = kushkiWebhookSchema.safeParse({ status: "APPROVAL" });
    expect(result.success).toBe(false);
  });
});
