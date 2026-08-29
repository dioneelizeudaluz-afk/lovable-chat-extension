const messageInput = document.getElementById("messageInput");
const chatForm = document.getElementById("chatForm");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("sendButton");
const status = document.getElementById("status");

const menuButton = document.getElementById("menuButton");
const menu = document.getElementById("menu");

let messageHistory = [];

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}`;

  message.innerHTML = `
    <div class="message-content">${escapeHTML(text)}</div>
  `;

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;

  messageHistory.push({
    text,
    type,
    time: Date.now()
  });

  saveHistory();
}

async function saveHistory() {
  try {
    await chrome.storage.local.set({
      rollesHistory: messageHistory
    });
  } catch (error) {
    console.error("Erro ao guardar histórico:", error);
  }
}

async function loadHistory() {
  try {
    const result = await chrome.storage.local.get("rollesHistory");

    if (Array.isArray(result.rollesHistory)) {
      messageHistory = result.rollesHistory;

      messageHistory.forEach((message) => {
        const element = document.createElement("div");
        element.className = `message ${message.type}`;

        element.innerHTML = `
          <div class="message-content">
            ${escapeHTML(message.text)}
          </div>
        `;

        messages.appendChild(element);
      });

      messages.scrollTop = messages.scrollHeight;
    }
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
  }
}

function showStatus(text, type = "") {
  status.textContent = text;
  status.className = `status ${type}`;
}

async function testBackground() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: "ping"
    });

    if (response?.success) {
      showStatus("Rolles pronto", "success");
    }
  } catch (error) {
    console.error("Background error:", error);
    showStatus("Erro no serviço da extensão", "error");
  }
}

async function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) return;

  addMessage(text, "user");

  messageInput.value = "";
  messageInput.disabled = true;
  sendButton.disabled = true;

  showStatus("A preparar resposta...");

  /*
   * Nesta versão o chat é local.
   * A ligação a um serviço de IA será adicionada
   * separadamente através de uma API autorizada.
   */

  setTimeout(() => {
    addMessage(
      "Recebi o teu pedido. A estrutura do Rolles está funcionando corretamente. A próxima etapa será conectar o chat a um serviço de IA autorizado.",
      "assistant"
    );

    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();

    showStatus("Rolles pronto", "success");
  }, 500);

  await saveHistory();
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

menuButton.addEventListener("click", () => {
  menu.classList.toggle("hidden");
});

document.addEventListener("click", (event) => {
  if (
    !menu.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    menu.classList.add("hidden");
  }
});

document.querySelectorAll(".quick-actions button").forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.prompt || "";
    messageInput.focus();
  });
});

document.querySelectorAll(".menu button").forEach((button) => {
  button.addEventListener("click", async () => {
    const action = button.dataset.action;

    if (action === "new") {
      messageHistory = [];
      await chrome.storage.local.remove("rollesHistory");

      messages.innerHTML = `
        <div class="welcome">
          <div class="logo">R</div>
          <h2>O que vamos criar hoje?</h2>
          <p>
            Descreve o projeto que queres criar e vamos organizar a ideia.
          </p>
        </div>
      `;

      showStatus("Novo projeto iniciado", "success");
    }

    if (action === "history") {
      showStatus(
        `Histórico: ${messageHistory.length} mensagens`
      );
    }

    if (action === "settings") {
      showStatus("Configurações estarão disponíveis em breve");
    }

    menu.classList.add("hidden");
  });
});

async function initialize() {
  await loadHistory();
  await testBackground();
}

initialize();
