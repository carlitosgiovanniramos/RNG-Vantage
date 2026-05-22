import { describe, it, expect } from "vitest";
import { mapKushkiStatus, isFinalTransactionStatus } from "@/lib/kushki/webhook";

describe("mapKushkiStatus", () => {
  it("APPROVAL -> completed", () => {
    expect(mapKushkiStatus("APPROVAL")).toBe("completed");
  });

  it("DECLINED -> failed", () => {
    expect(mapKushkiStatus("DECLINED")).toBe("failed");
  });

  it("EXPIRED -> failed", () => {
    expect(mapKushkiStatus("EXPIRED")).toBe("failed");
  });

  it("PENDING -> pending", () => {
    expect(mapKushkiStatus("PENDING")).toBe("pending");
  });

  it("INITIALIZED -> pending", () => {
    expect(mapKushkiStatus("INITIALIZED")).toBe("pending");
  });
});

describe("isFinalTransactionStatus", () => {
  it("considera finales a completed, failed y refunded", () => {
    expect(isFinalTransactionStatus("completed")).toBe(true);
    expect(isFinalTransactionStatus("failed")).toBe(true);
    expect(isFinalTransactionStatus("refunded")).toBe(true);
  });

  it("no considera final a pending", () => {
    expect(isFinalTransactionStatus("pending")).toBe(false);
  });
});
