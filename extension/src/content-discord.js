function extractMessageText(container) {
  const content = container.querySelector('[class*="messageContent"]');
  return content?.textContent?.trim() ?? "";
}

function renderResult(panel, data) {
  const tierClass = data.outlet ? `nomae-tier-${data.outlet.tier.toLowerCase()}` : "";
  panel.className = `nomae-result-panel ${tierClass}`;
  const fc = data.factChecks[0];
  panel.innerHTML = `
    <h4>NomaeTrust Action Card</h4>
    <p>${escapeHtml(data.actionSummary)}</p>
    ${
      fc
        ? `<p><strong>Fact-check:</strong> ${escapeHtml(fc.publisher)} — ${escapeHtml(fc.rating)}</p>`
        : ""
    }
    <p><a href="${escapeAttr(data.cardUrl)}" target="_blank" rel="noopener">Open full Action Card →</a></p>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

async function verifyMessage(btn, container) {
  const text = extractMessageText(container);
  if (!text) {
    alert("Could not read message text.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Verifying…";

  let panel = container.querySelector(".nomae-result-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "nomae-result-panel";
    container.appendChild(panel);
  }

  chrome.runtime.sendMessage(
    { type: "NOMAE_VERIFY", text, platform: "discord" },
    (response) => {
      btn.disabled = false;
      btn.textContent = "Verify";

      if (!response?.ok) {
        panel.innerHTML = `<p style="color:#f87171">Error: ${escapeHtml(response?.error ?? "Unknown")}</p>`;
        return;
      }
      renderResult(panel, response.data);
    },
  );
}

function injectOnHover(container) {
  if (container.dataset.nomaeBound) return;
  container.dataset.nomaeBound = "1";

  const toolbar = document.createElement("div");
  toolbar.style.cssText = "margin-top:4px;";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "nomae-verify-btn";
  btn.textContent = "Verify";
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    verifyMessage(btn, container);
  });

  toolbar.appendChild(btn);
  container.appendChild(toolbar);
}

function scanMessages() {
  document
    .querySelectorAll('[class*="messageContent"]')
    .forEach((el) => {
      const container = el.closest('[class*="message"]') || el.parentElement;
      if (container) injectOnHover(container);
    });
}

const observer = new MutationObserver(() => scanMessages());
observer.observe(document.body, { childList: true, subtree: true });
scanMessages();
