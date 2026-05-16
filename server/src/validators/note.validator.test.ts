import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateCreateNoteBody,
  validateNoteListQuery,
  validateUpdateNoteBody
} from "./note.validator";
import { HttpError } from "../utils/http-error";

describe("note validators", () => {
  it("normalizes duplicate tags on create", () => {
    const payload = validateCreateNoteBody({
      title: "Roadmap",
      content: "Ship the notes workspace",
      tags: [" Work ", "work", "", "AI"],
      category: "Planning"
    });

    assert.deepEqual(payload.tags, ["work", "ai"]);
  });

  it("parses list filters and pagination safely", () => {
    const query = validateNoteListQuery({
      archived: "true",
      sort: "asc",
      page: "2",
      limit: "10"
    });

    assert.deepEqual(query, {
      archived: true,
      sort: 1,
      page: 2,
      limit: 10,
      search: undefined,
      tag: undefined,
      category: undefined
    });
  });

  it("rejects invalid sort values", () => {
    assert.throws(() => validateNoteListQuery({ sort: "newest" }), HttpError);
  });

  it("rejects empty update payloads", () => {
    assert.throws(() => validateUpdateNoteBody({}), HttpError);
  });
});
