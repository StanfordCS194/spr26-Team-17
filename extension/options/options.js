/* global chrome */
(function () {
  const key = document.getElementById("key");
  const model = document.getElementById("model");
  const aiEnabled = document.getElementById("aiEnabled");
  const status = document.getElementById("status");
  const save = document.getElementById("save");

  function load() {
    chrome.storage.sync.get(["apiKey", "model", "aiEnabled"], (r) => {
      key.value = r.apiKey || "";
      model.value = r.model || "gpt-4o-mini";
      aiEnabled.checked = r.aiEnabled !== false;
    });
  }

  save.addEventListener("click", () => {
    chrome.storage.sync.set(
      {
        apiKey: (key.value || "").trim(),
        model: (model.value || "gpt-4o-mini").trim() || "gpt-4o-mini",
        aiEnabled: aiEnabled.checked,
      },
      () => {
        status.textContent = "Saved.";
        setTimeout(() => {
          status.textContent = "";
        }, 2000);
      }
    );
  });

  load();
})();
