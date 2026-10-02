import test from "node:test";
import assert from "node:assert/strict";
import { isNewerVersion } from "../src/utils/versions.js";
test("Android updates compare numeric versions and reject downgrades", () => {
  assert.equal(isNewerVersion("2.10.0", "2.9.9"), true);
  assert.equal(isNewerVersion("2.1.1", "2.1.0"), true);
  assert.equal(isNewerVersion("3.0.0", "2.99.99"), true);
  assert.equal(isNewerVersion("2.1.0", "2.1.0"), false);
  assert.equal(isNewerVersion("2.0.99", "2.1.0"), false);
  assert.equal(isNewerVersion("1.99.99", "2.1.0"), false);
  assert.equal(isNewerVersion("2.1.0-preview", "2.0.0"), false);
  assert.equal(isNewerVersion("2.1.0", null), false);
});
