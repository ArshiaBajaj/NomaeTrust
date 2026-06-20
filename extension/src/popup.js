const apiUrlInput = document.getElementById("apiUrl");
const apiKeyInput = document.getElementById("apiKey");
const frontendUrlInput = document.getElementById("frontendUrl");
const statusEl = document.getElementById("status");

chrome.storage.sync.get(
  {
    apiUrl: "http://localhost:3001",
    apiKey: "",
    frontendUrl: "http://localhost:5173",
  },
  (data) => {
    apiUrlInput.value = data.apiUrl;
    apiKeyInput.value = data.apiKey;
    frontendUrlInput.value = data.frontendUrl;
  },
);

document.getElementById("save").addEventListener("click", () => {
  chrome.storage.sync.set(
    {
      apiUrl: apiUrlInput.value.trim() || "http://localhost:3001",
      apiKey: apiKeyInput.value.trim(),
      frontendUrl: frontendUrlInput.value.trim() || "http://localhost:5173",
    },
    () => {
      statusEl.textContent = "Saved.";
      setTimeout(() => {
        statusEl.textContent = "";
      }, 2000);
    },
  );
});
