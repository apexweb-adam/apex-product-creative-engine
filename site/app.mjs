const tierData = {
  core: {
    name: "Core",
    price: "$49",
    reason: "The full workflow for personal commercial use, with one worked example.",
    checkout: "https://buy.stripe.com/6oU28qeLh8MScFJ7s6ao800",
    features: [
      "Full prompt workflow",
      "Quick-start map",
      "One worked example",
      "12 months of version updates"
    ]
  },
  pro: {
    name: "Pro",
    price: "$99",
    reason: "Core plus three examples, model-specific production variants, troubleshooting, and an ApexPrompt-ready payload.",
    checkout: "https://buy.stripe.com/28E9AS5aHaV08pt5jYao801",
    features: [
      "Everything in Core",
      "Three worked examples",
      "Image and video model variants",
      "Troubleshooting and ApexPrompt payload"
    ]
  },
  agency: {
    name: "Agency",
    price: "$249",
    reason: "Pro plus client-delivery rights, editable intake, and a handoff and QA checklist.",
    checkout: "https://buy.stripe.com/28EaEWbz52ougVZ13Iao802",
    features: [
      "Everything in Pro",
      "Use for client delivery",
      "Editable client intake",
      "Client handoff and QA checklist"
    ]
  }
};

export function recommendTier({ usage, variants, toolkit }) {
  if (usage === "client") {
    return "agency";
  }
  if (variants === "yes" || toolkit === "yes") {
    return "pro";
  }
  return "core";
}

function readAnswers(form) {
  return {
    usage: new FormData(form).get("usage"),
    variants: new FormData(form).get("variants"),
    toolkit: new FormData(form).get("toolkit")
  };
}

function renderRecommendation(tier) {
  const data = tierData[tier];
  const title = document.querySelector("#recommendation-title");
  const reason = document.querySelector("#recommendation-reason");
  const price = document.querySelector("#recommendation-price");
  const features = document.querySelector("#recommendation-features");
  const checkout = document.querySelector("#recommendation-checkout");

  title.textContent = data.name;
  reason.textContent = data.reason;
  price.innerHTML = `${data.price} <small>one time</small>`;
  features.replaceChildren(...data.features.map((feature) => {
    const item = document.createElement("li");
    item.textContent = feature;
    return item;
  }));
  checkout.href = data.checkout;
  checkout.dataset.checkout = tier;
  checkout.firstChild.textContent = `Buy ${data.name} `;
}

function initialiseFitGuide() {
  const form = document.querySelector("#fit-form");
  if (!form) {
    return;
  }

  const update = () => renderRecommendation(recommendTier(readAnswers(form)));
  form.addEventListener("change", update);
  form.addEventListener("reset", () => window.setTimeout(update, 0));
  update();
}

if (typeof document !== "undefined") {
  initialiseFitGuide();
}
