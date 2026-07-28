import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { recommendTier } from "./site/app.mjs";

const html = await readFile(new URL("./site/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("./site/styles.css", import.meta.url), "utf8");
const js = await readFile(new URL("./site/app.mjs", import.meta.url), "utf8");

const occurrences = (value, source = html) => source.split(value).length - 1;

assert.match(html, /^<!doctype html>/i);
assert.match(html, /<html lang="en">/);
assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
assert.match(html, /<link rel="canonical" href="https:\/\/apexweb-adam\.github\.io\/apex-product-creative-engine\/">/);
assert.equal(occurrences("<h1"), 1, "The page must expose exactly one h1.");
assert.match(html, /Turn product facts into a creative system, without inventing the proof\./);

for (const metric of [
  "6 / 6",
  "72 / 72",
  "86.5 sec",
  "Total recorded workflow time was 653 seconds",
  "Seven visuals were attempted",
  "one invented-object defect was rejected",
  "six were accepted"
]) {
  assert.ok(html.includes(metric), `Missing proof boundary: ${metric}`);
}

for (const statement of [
  "not a revenue or ROAS guarantee",
  "It does not guarantee revenue, ROAS, legal compliance, platform acceptance",
  "No resale or redistribution of the library",
  "Founding validation offer"
]) {
  assert.ok(html.includes(statement), `Missing commercial boundary: ${statement}`);
}

const checkoutRoutes = {
  core: "https://buy.stripe.com/6oU28qeLh8MScFJ7s6ao800",
  pro: "https://buy.stripe.com/28E9AS5aHaV08pt5jYao801",
  agency: "https://buy.stripe.com/28EaEWbz52ougVZ13Iao802"
};

for (const [tier, route] of Object.entries(checkoutRoutes)) {
  assert.ok(occurrences(route) >= 2, `${tier} checkout must appear in structured data and page controls.`);
  assert.match(html, new RegExp(`data-checkout="${tier}"`));
  assert.ok(js.includes(route), `${tier} recommendation route must match the verified checkout.`);
}

assert.equal(recommendTier({ usage: "internal", variants: "no", toolkit: "no" }), "core");
assert.equal(recommendTier({ usage: "internal", variants: "yes", toolkit: "no" }), "pro");
assert.equal(recommendTier({ usage: "internal", variants: "no", toolkit: "yes" }), "pro");
assert.equal(recommendTier({ usage: "client", variants: "no", toolkit: "no" }), "agency");
assert.equal(recommendTier({ usage: "client", variants: "yes", toolkit: "yes" }), "agency");

for (const tierCopy of [
  "Personal commercial use",
  "Three worked examples",
  "Model-specific image and video variants",
  "Use for client delivery",
  "Editable client intake",
  "Client handoff and QA checklist"
]) {
  assert.ok(html.includes(tierCopy), `Missing verified tier scope: ${tierCopy}`);
}

assert.match(html, /data-route="free-sample"/);
assert.match(html, /data-route="private-proof"/);
assert.match(html, /utm_source=github_pages/);
assert.match(html, /utm_campaign=pce_validation/);

for (const breakpoint of ["1080px", "720px", "480px"]) {
  assert.ok(css.includes(`max-width: ${breakpoint}`), `Missing responsive breakpoint ${breakpoint}.`);
}
assert.match(css, /prefers-reduced-motion: reduce/);
assert.match(css, /:focus-visible/);
assert.match(css, /overflow-x: hidden/);

assert.doesNotMatch(html, /best[- ]selling|most popular|limited time|countdown/i);
assert.doesNotMatch(html, /—/);
assert.doesNotMatch(css, /linear-gradient\([^v]/, "Visual design must not use decorative gradients.");

const productSchemaMatch = html.match(/<script type="application\/ld\+json" id="product-schema">\s*([\s\S]*?)\s*<\/script>/);
const faqSchemaMatch = html.match(/<script type="application\/ld\+json" id="faq-schema">\s*([\s\S]*?)\s*<\/script>/);
assert.ok(productSchemaMatch, "Product structured data is required.");
assert.ok(faqSchemaMatch, "FAQ structured data is required.");
const productSchema = JSON.parse(productSchemaMatch[1]);
const faqSchema = JSON.parse(faqSchemaMatch[1]);
assert.equal(productSchema.offers.length, 3);
assert.deepEqual(productSchema.offers.map((offer) => offer.price), ["49", "99", "249"]);
assert.equal(faqSchema.mainEntity.length, 4);

console.log("Site contract: PASS");
console.log("Verified evidence boundaries, tier routing, checkout destinations, responsive CSS, accessibility hooks, and structured data.");
