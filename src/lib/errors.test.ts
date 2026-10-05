import { describe, expect, it } from "vitest";
import { GENERIC_ERROR, toUserMessage } from "./errors";
import { safeRedirectPath } from "./validation/auth";

describe("toUserMessage", () => {
  it("maps Postgres unique violations", () => {
    expect(toUserMessage({ code: "23505", message: "duplicate key value" })).toBe(
      "Dieser Eintrag existiert bereits.",
    );
  });

  it("maps Supabase auth error codes", () => {
    expect(toUserMessage({ code: "invalid_credentials" })).toBe("E-Mail oder Passwort ist falsch.");
  });

  it("never leaks unknown technical messages", () => {
    expect(toUserMessage({ code: "XX000", message: "internal error at line 3" })).toBe(
      GENERIC_ERROR,
    );
    expect(toUserMessage(null)).toBe(GENERIC_ERROR);
  });
});

describe("safeRedirectPath", () => {
  it("allows relative app paths", () => {
    expect(safeRedirectPath("/woche")).toBe("/woche");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.example")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.example")).toBe("/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
  });
});
