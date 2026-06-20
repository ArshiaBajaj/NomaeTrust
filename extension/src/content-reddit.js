function extractPostText(container) {
  const titleEl =
    container.querySelector('[slot="title"]') ||
    container.querySelector("h1") ||
    container.querySelector('[data-testid="post-content"] h3');
  const bodyEl =
    container.querySelector('[slot="text-body"]') ||
    container.querySelector('[data-test-id="post-content"]');

  const title = titleEl?.textContent?.trim() ?? "";
  const body = bodyEl?.textContent?.trim() ?? "";
  return [title, body].filter(Boolean).join(" — ");
}

function renderResult(panel, data) {
  const tierClass = data.outlet ? `nomae-tier-${data.outlet.tier.toLowerCase()}` : "";
  panel.className = `nomae-result-panel ${tierClass}`;
  const fc = data.factChecks[0];
  panel.innerHTML = `
    <h4>NomaeTrust Action Card</h4>
    <p>${escapeHtml(data.actionSummary)}</p>
    ${
      data.outlet
        ? `<p><strong>Outlet:</strong> ${escapeHtml(data.outlet.name)} (Tier ${escapeHtml(data.outlet.tier)})</p>`
        : ""
    }
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

async function verifyPost(btn, container) {
  const text = extractPostText(container);
  if (!text) {
    alert("Could not read post text.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Verifying…";

  let panel = container.querySelector(".nomae-result-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "nomae-result-panel";
    btn.insertAdjacentElement("afterend", panel);
  }

  chrome.runtime.sendMessage(
    { type: "NOMAE_VERIFY", text, platform: "reddit" },
    (response) => {
      btn.disabled = false;
      btn.textContent = "Verify with NomaeTrust";

      if (!response?.ok) {
        panel.innerHTML = `<p style="color:#f87171">Error: ${escapeHtml(response?.error ?? "Unknown")}</p>`;
        return;
      }
      renderResult(panel, response.data);
    },
  );
}

function injectButton(container) {
  if (container.querySelector(".nomae-verify-btn")) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "nomae-verify-btn";
  btn.textContent = "Verify with NomaeTrust";
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    verifyPost(btn, container);
  });

  const anchor =
    container.querySelector('[slot="text-body"]')?.parentElement ||
    container.querySelector("h1")?.parentElement ||
    container;

  anchor.appendChild(btn);
}

function scanPosts() {
  const posts = document.querySelectorAll("shreddit-post, [data-testid='post-container']");
  posts.forEach(injectButton);
}

const observer = new MutationObserver(() => scanPosts());
observer.observe(document.body, { childList: true, subtree: true });
scanPosts();
