import { test, expect } from "@playwright/test";

test("landing page loads correctly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "RGL Estudio" })).toBeVisible();
});

test("catalogo page is accessible", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: /catalogo/i })).toBeVisible();
});

test("reservar page is accessible", async ({ page }) => {
  await page.goto("/reservar");
  await expect(page.getByRole("heading", { name: /reservar/i })).toBeVisible();
});
