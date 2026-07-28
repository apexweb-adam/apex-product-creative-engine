# Apex Product Creative Engine

[![Verify free sample](https://github.com/apexweb-adam/apex-product-creative-engine/actions/workflows/verify.yml/badge.svg)](https://github.com/apexweb-adam/apex-product-creative-engine/actions/workflows/verify.yml)
[![Deploy buyer page](https://github.com/apexweb-adam/apex-product-creative-engine/actions/workflows/pages.yml/badge.svg)](https://github.com/apexweb-adam/apex-product-creative-engine/actions/workflows/pages.yml)

An evidence-gated ecommerce creative workflow by [Apex Web](https://apexweb.hu/ai-prompt-konyvtar-webshopoknak?utm_source=github&utm_medium=product_repository&utm_campaign=pce_validation).

[Open the English buyer guide and license selector](https://apexweb-adam.github.io/apex-product-creative-engine/).

The free sample in this repository checks proposed product copy against numbered source evidence. It maps every factual claim, catches unsupported proof, and returns a fixed `PASS`, `REPAIR`, or `BLOCK` release decision.

## Why this exists

AI can produce polished ecommerce copy while quietly adding an unverified runtime, performance result, certification, customer quote, popularity claim, discount, or product behavior. More fluent copy is not safer copy.

This sample puts an evidence gate before publication:

1. Supply numbered product sources.
2. Supply the exact proposed copy.
3. Receive a claim-by-claim fact lock.
4. Remove, verify, or safely rewrite unsupported wording.
5. Keep a do-not-generate list for later creative work.

## Verified free sample

- [Copy-ready prompt](./PROMPT.md)
- [Spin Scrubber input](./examples/spin-scrubber-input.md) and [audited output](./examples/spin-scrubber-output.md)
- [LED Mount input](./examples/led-mount-input.md) and [audited output](./examples/led-mount-output.md)
- [Deterministic contract verifier](./verify-sample.mjs)

| Owned fixture | Seeded risk | Expected | Observed | Required sections | Contract |
|---|---|---:|---:|---:|---:|
| GravN Spin Scrubber | Unsupported time saving, germ removal, waterproofing, and popularity | BLOCK | BLOCK | 6/6 | PASS |
| GravN LED Mount | Unsupported sensor behavior, runtime, and installation time | REPAIR | REPAIR | 6/6 | PASS |

The bounded sample build and two-fixture operator run took 139 seconds. Adversarial review found one release-rule contradiction before publication; it was repaired and the complete verifier then passed with zero remaining fixture failures.

Prompt SHA-256:

```text
981075487044657d7ef06d699a219baa5ce783c7c26916cfe60cff0eb598124a
```

## Run it

1. Open [PROMPT.md](./PROMPT.md).
2. Replace the four delimited input blocks with your product evidence, channel, restrictions, and proposed copy.
3. Run the prompt in a capable text model.
4. Check the result against the fixed six-section output contract.

Verify the included examples:

```bash
node verify-sample.mjs
```

No dependencies, account, or API key are required for the deterministic check.

## Free gate vs. complete workflow

| Capability | Free repository sample | Paid Product Creative Engine |
|---|:---:|:---:|
| Source-based fact lock | Included | Included |
| Claim release decision | Included | Included |
| Safe rewrite and do-not-generate list | Included | Included |
| Product-context compilation | Not included | Included |
| Buyer truth and campaign strategy | Not included | Included |
| 12 creative concepts | Not included | Included |
| Image, listing, video, and UGC briefs | Not included | Included |
| Advertising copy system | Not included | Included |
| Full creative preflight | Not included | Included |
| 30-day test plan and learning loop | Not included | Included |

One-time B2B licenses:

- Core: 49 USD
- Pro: 99 USD
- Agency: 249 USD

[View the Hungarian product page and checkout](https://apexweb.hu/ai-prompt-konyvtar-webshopoknak?utm_source=github&utm_medium=product_repository&utm_campaign=pce_validation) or [inspect the full English proof pack](https://apex-product-creative-engine.judimix.chatgpt.site/?utm_source=github&utm_medium=product_repository&utm_campaign=pce_validation).

## Evidence boundary

The observed workflow evidence covers output-contract completion, factual grounding, claim handling, timing, and rejected creative preservation on owned fixtures. It does not prove revenue, return on ad spend, legal compliance, platform approval, or results for another product.

The sample is an operator aid, not legal advice. Human review remains required for regulated, safety, medical, environmental, comparative, and market-specific claims.

## Use permission

You may use and adapt this free sample inside your own business or client delivery under [SAMPLE-USE.md](./SAMPLE-USE.md). Reselling or republishing the sample files as a standalone or competing prompt product is not permitted.

Copyright 2026 Tokár Ádám, Apex Web.
