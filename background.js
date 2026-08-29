chrome.runtime.onInstalled.addListener(() => {
  console.log("Rolles Mobile Assistant instalado.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === "ping") {
    sendResponse({
      success: true,
      message: "Background funcionando."
    });
    return;
  }

  if (message?.action === "saveData") {
    chrome.storage.local.set({
      [message.key]: message.value
    })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({
          success: false,
          error: error.message
        });
      });

    return true;
  }

  if (message?.action === "getData") {
    chrome.storage.local.get(message.key)
      .then((result) => {
        sendResponse({
          success: true,
          value: result[message.key] ?? null
        });
      })
      .catch((error) => {
        sendResponse({
          success: false,
          error: error.message
        });
      });

    return true;
  }
});
