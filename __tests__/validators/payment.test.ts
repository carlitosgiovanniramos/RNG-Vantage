import { describe, it, expect } from "vitest";
import {
  payphonePaymentSchema,
  manualTransferInitSchema,
} from "@/lib/validators/payment";

describe("payphonePaymentSchema", () => {
  it("acepta datos validos", () => {
    const result = payphonePaymentSchema.safeParse({
      service_id: "123e4567-e89b-12d3-a456-426614174000",
      auto_renew: true,
    });
    expect(result.success).toBe(true);
  });

  it("aplica false por defecto a auto_renew", () => {
    const result = payphonePaymentSchema.safeParse({
      service_id: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.auto_renew).toBe(false);
    }
  });

  it("rechaza service_id que no es uuid", () => {
    const result = payphonePaymentSchema.safeParse({
      service_id: "no-es-uuid",
      auto_renew: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("manualTransferInitSchema", () => {
  it("acepta datos validos", () => {
    const result = manualTransferInitSchema.safeParse({
      service_id: "123e4567-e89b-12d3-a456-426614174000",
      auto_renew: false,
    });
    expect(result.success).toBe(true);
  });

  it("aplica false por defecto a auto_renew", () => {
    const result = manualTransferInitSchema.safeParse({
      service_id: "123e4567-e89b-12d3-a456-426614174000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.auto_renew).toBe(false);
    }
  });

  it("rechaza service_id que no es uuid", () => {
    const result = manualTransferInitSchema.safeParse({
      service_id: "no-es-uuid",
    });
    expect(result.success).toBe(false);
  });
});
