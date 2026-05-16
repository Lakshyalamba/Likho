import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateLoginBody, validateSignupBody } from "./auth.validator";
import { HttpError } from "../utils/http-error";

describe("auth validators", () => {
  it("normalizes valid signup payloads", () => {
    const payload = validateSignupBody({
      name: "  Demo User  ",
      email: "DEMO@EXAMPLE.COM ",
      password: "password123"
    });

    assert.deepEqual(payload, {
      name: "Demo User",
      email: "demo@example.com",
      password: "password123"
    });
  });

  it("rejects weak signup passwords", () => {
    assert.throws(
      () =>
        validateSignupBody({
          name: "Demo User",
          email: "demo@example.com",
          password: "short"
        }),
      HttpError
    );
  });

  it("rejects invalid login emails", () => {
    assert.throws(
      () =>
        validateLoginBody({
          email: "not-an-email",
          password: "password123"
        }),
      HttpError
    );
  });
});
