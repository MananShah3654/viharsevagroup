/* global __dirname */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const loaded = new Map();
function loadTs(relative) {
  const filename = path.resolve(__dirname, "..", relative);
  if (loaded.has(filename)) return loaded.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  instance.require = (name) => name === "@/src/core/vihar/utils"
    ? loadTs("src/core/vihar/utils.ts")
    : Module.prototype.require.call(instance, name);
  loaded.set(filename, instance);
  instance._compile(compiled, filename);
  return instance.exports;
}
const utils = loadTs("src/core/vihar/utils.ts");
const { formatViharRecordForWhatsapp } = loadTs("src/core/vihar/whatsapp-format.ts");

test("Vihar years change exactly on August 1", () => {
  for (const [day, month, year, expected] of [
    [31, 7, 2026, "25-26"], [1, 8, 2026, "26-27"],
    [31, 7, 2027, "26-27"], [1, 8, 2027, "27-28"],
  ]) assert.equal(utils.viharYearLabel(new Date(year, month - 1, day)), expected);
});

test("new season number 1 sorts before the previous season's highest number", () => {
  const old = { route_no: "999", vihar_date: "31/07/26" };
  const current = { route_no: "1", vihar_date: "01/08/26" };
  assert.deepEqual([old, current].sort(utils.sortByRouteDesc), [current, old]);
  const next = { route_no: "10", vihar_date: "03/08/26" };
  assert.deepEqual([current, next].sort(utils.sortByRouteDesc), [next, current]);
});

const vihar = {
  id: "preview", total_no: "501", route_no: "1", vihar_date: "01/08/26",
  vihar_time: "05:30", from_upashray: "A", to_upashray: "B", approx_kms: 1,
  sadhu_bhagvant: 1, sadhviji_bhagvant: 0, mumukshu: 0, wheelchair: 0,
};

test("announcements distinguish the original number and yearly number", () => {
  const message = formatViharRecordForWhatsapp(vihar);
  assert.ok(message.includes("મૂળ ક્રમાંક- ૫૦૧"));
  assert.ok(message.includes("વાર્ષિક રૂટ- ૧ (26-27)"));
});

test("missing originals are not invented from yearly numbers", () => {
  const message = formatViharRecordForWhatsapp({ ...vihar, total_no: undefined });
  assert.ok(!message.includes("મૂળ ક્રમાંક"));
  assert.ok(message.includes("વાર્ષિક રૂટ- ૧ (26-27)"));
});
