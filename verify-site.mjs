import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  recommendTier,
  withAttributionDefaults,
  withStripeAttribution
} from "./site/app.mjs";

const html = await readFile(new URL("./site/index.html", import.meta.url), "utf8");
const css = await readFile(new URL("./site/styles.css", import.meta.url), "utf8");
const js = await readFile(new URL("./site/app.mjs", import.meta.url), "utf8");
const guide = await readFile(
  new URL("./site/ecommerce-product-description-prompt/index.html", import.meta.url),
  "utf8"
);
const guideCss = await readFile(new URL("./site/guide.css", import.meta.url), "utf8");
const robots = await readFile(new URL("./site/robots.txt", import.meta.url), "utf8");
const sitemap = await readFile(new URL("./site/sitemap.xml", import.meta.url), "utf8");
const favicon = await readFile(new URL("./site/favicon.svg", import.meta.url), "utf8");
const indexNowKey = await readFile(
  new URL("./site/780d05b71025217a54601d50e7eeef64.txt", import.meta.url),
  "utf8"
);

const occurrences = (value, source = html) => source.split(value).length - 1;

assert.match(html, /^<!doctype html>/i);
assert.match(html, /<html lang="en">/);
assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
assert.match(html, /<link rel="canonical" href="https:\/\/apexweb-adam\.github\.io\/apex-product-creative-engine\/">/);
assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\.\/favicon\.svg">/);
assert.match(html, /<script type="module" src="\.\/app\.mjs\?v=e1dd8b16"><\/script>/);
assert.match(favicon, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 64 64">/);
assert.equal(
  indexNowKey,
  "780d05b71025217a54601d50e7eeef64\n",
  "The root IndexNow ownership file must contain only the exact public key."
);
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

assert.equal(
  withStripeAttribution(
    checkoutRoutes.core,
    "?utm_source=aikendra&utm_medium=directory&utm_campaign=pce_validation&utm_content=tool_listing_02",
    { tier: "core", placement: "pricing" }
  ),
  `${checkoutRoutes.core}?utm_source=aikendra&utm_medium=directory&utm_campaign=pce_validation&utm_content=tool_listing_02&client_reference_id=pce_core_aikendra_tool_listing_02_pricing`
);
assert.equal(
  withStripeAttribution(
    checkoutRoutes.pro,
    "?utm_source=buyer%40example.com&utm_medium=directory&utm_campaign=pce_validation&utm_content=tool_listing_03&utm_term=product-creative",
    { tier: "pro", placement: "fit-recommendation" }
  ),
  `${checkoutRoutes.pro}?utm_medium=directory&utm_campaign=pce_validation&utm_content=tool_listing_03&utm_term=product-creative&client_reference_id=pce_pro_direct_tool_listing_03_fit-recommendation`,
  "Unsafe campaign values must be dropped instead of forwarded to Stripe."
);
assert.equal(
  withStripeAttribution(
    checkoutRoutes.agency,
    "?utm_source=" + "a".repeat(151),
    { tier: "agency", placement: "pricing" }
  ),
  `${checkoutRoutes.agency}?client_reference_id=pce_agency_direct_buyer_page_pricing`,
  "Stripe campaign values over 150 characters must be dropped and must not enter the reference."
);
assert.equal(
  new URL(withStripeAttribution(
    checkoutRoutes.core,
    `?utm_source=${"s".repeat(50)}&utm_content=${"c".repeat(50)}`,
    { tier: "t".repeat(50), placement: "p".repeat(50) }
  )).searchParams.get("client_reference_id").length,
  200,
  "Stripe client_reference_id must not exceed the documented 200-character limit."
);

const guideAttribution = withAttributionDefaults("", {
  attributionSource: "github_guide",
  attributionMedium: "organic_content",
  attributionCampaign: "pce_validation",
  attributionContent: "product_description_prompt_01"
});
assert.equal(
  guideAttribution.toString(),
  "utm_source=github_guide&utm_medium=organic_content&utm_campaign=pce_validation&utm_content=product_description_prompt_01"
);
assert.equal(
  withStripeAttribution(checkoutRoutes.core, guideAttribution, {
    tier: "core",
    placement: "product-description-guide"
  }),
  `${checkoutRoutes.core}?utm_source=github_guide&utm_medium=organic_content&utm_campaign=pce_validation&utm_content=product_description_prompt_01&client_reference_id=pce_core_github_guide_product_description_prompt_01_product-description-guide`,
  "The guide checkout must retain its PII-free default attribution when the page has no inbound UTM."
);
assert.equal(
  withAttributionDefaults("?utm_source=partner", {
    attributionSource: "github_guide",
    attributionContent: "product_description_prompt_01"
  }).get("utm_source"),
  "partner",
  "A valid inbound source must take precedence over the guide fallback."
);

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
assert.match(robots, /User-agent: \*/);
assert.match(robots, /Allow: \//);
assert.match(robots, /Sitemap: https:\/\/apexweb-adam\.github\.io\/apex-product-creative-engine\/sitemap\.xml/);
assert.match(sitemap, /<loc>https:\/\/apexweb-adam\.github\.io\/apex-product-creative-engine\/<\/loc>/);
assert.match(
  sitemap,
  /<loc>https:\/\/apexweb-adam\.github\.io\/apex-product-creative-engine\/ecommerce-product-description-prompt\/<\/loc>/
);
assert.match(sitemap, /<lastmod>2026-07-28<\/lastmod>/);

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

assert.match(guide, /^<!doctype html>/i);
assert.match(guide, /<html lang="en">/);
assert.match(guide, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
assert.match(
  guide,
  /<link rel="canonical" href="https:\/\/apexweb-adam\.github\.io\/apex-product-creative-engine\/ecommerce-product-description-prompt\/">/
);
assert.match(guide, /<link rel="icon" type="image\/svg\+xml" href="\.\.\/favicon\.svg">/);
assert.match(guide, /<script type="module" src="\.\.\/app\.mjs\?v=e1dd8b16"><\/script>/);
assert.equal(occurrences("<h1", guide), 1, "The product-description guide must expose exactly one h1.");
assert.match(
  guide,
  /Ecommerce product description prompt: write persuasive copy without inventing claims\./
);
assert.match(guide, /A reliable AI product description prompt does three jobs separately/);
assert.equal(occurrences('class="step-number"', guide), 5, "The guide must render five visible steps.");
assert.equal(occurrences("<details>", guide), 5, "The guide must render five visible FAQs.");

for (const proof of [
  "6 / 6",
  "72 / 72",
  "86.5 sec",
  "Total recorded time was 653 seconds",
  "Seven visuals were attempted",
  "one was rejected for inventing a second device",
  "six passed full-resolution review"
]) {
  assert.ok(guide.includes(proof), `Missing guide evidence boundary: ${proof}`);
}

for (const boundary of [
  "not legal advice",
  "not legal advice or a guarantee of marketplace acceptance, conversion, revenue, or ROAS",
  "not independent buyer research or evidence of conversion, revenue, ROAS, legal compliance"
]) {
  assert.ok(guide.includes(boundary), `Missing guide limitation: ${boundary}`);
}

for (const source of [
  "https://consumer.ftc.gov/business-guidance/advertising-marketing/advertising-marketing-basics",
  "https://support.google.com/merchants/answer/6150127?hl=en"
]) {
  assert.ok(guide.includes(source), `Missing primary policy source: ${source}`);
}

for (const [tier, route] of Object.entries(checkoutRoutes)) {
  assert.equal(occurrences(route, guide), 1, `${tier} guide checkout must appear exactly once.`);
  assert.match(guide, new RegExp(`data-checkout="${tier}"`));
}

for (const attribution of [
  'data-attribution-source="github_guide"',
  'data-attribution-medium="organic_content"',
  'data-attribution-campaign="pce_validation"',
  'data-attribution-content="product_description_prompt_01"',
  'data-placement="product-description-guide"'
]) {
  assert.equal(occurrences(attribution, guide), 3, `Guide checkout attribution must cover all tiers: ${attribution}`);
}

const schemaById = (id) => {
  const match = guide.match(new RegExp(
    `<script type="application/ld\\+json" id="${id}">\\s*([\\s\\S]*?)\\s*<\\/script>`
  ));
  assert.ok(match, `Missing guide schema: ${id}`);
  return JSON.parse(match[1]);
};
const articleSchema = schemaById("article-schema");
const breadcrumbSchema = schemaById("breadcrumb-schema");
const howToSchema = schemaById("howto-schema");
const guideFaqSchema = schemaById("guide-faq-schema");
assert.equal(articleSchema.dateModified, "2026-07-28");
assert.equal(articleSchema.author.name, "Tokár Ádám");
assert.equal(breadcrumbSchema.itemListElement.length, 2);
assert.equal(howToSchema.step.length, 5);
assert.equal(guideFaqSchema.mainEntity.length, 5);

for (const breakpoint of ["1080px", "720px", "480px"]) {
  assert.ok(guideCss.includes(`max-width: ${breakpoint}`), `Guide CSS is missing breakpoint ${breakpoint}.`);
}
assert.match(guideCss, /prefers-reduced-motion: reduce/);
assert.doesNotMatch(guide, /—/);
assert.doesNotMatch(guideCss, /linear-gradient/i);
assert.doesNotMatch(guide, /best[- ]selling|most popular|limited time|countdown/i);
assert.match(html, /href="\.\/ecommerce-product-description-prompt\/">English prompt guide<\/a>/);

console.log("Site contract: PASS");
console.log("Verified buyer and discovery pages, evidence boundaries, tier routing, checkout destinations, responsive CSS, accessibility hooks, and structured data.");
