import { describe, it, expect } from "vitest";
import { siwpClient } from "../client";

describe("SIWP Client Plugin", () => {
  it("should have the correct plugin id", () => {
    const plugin = siwpClient();
    expect(plugin.id).toBe("siwp");
  });

  it("should have $InferServerPlugin defined", () => {
    const plugin = siwpClient();
    expect(plugin).toHaveProperty("$InferServerPlugin");
  });

  it("should return a new instance on each call", () => {
    const a = siwpClient();
    const b = siwpClient();
    expect(a).not.toBe(b);
    expect(a.id).toBe(b.id);
  });
});
