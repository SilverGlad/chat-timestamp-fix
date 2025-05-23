// chat-timestamp-fix/scripts/main.js

const MODULE_ID = "chat-timestamp-fix";
const UTC_OFFSET = -3; // fixo por enquanto

function getFormattedDateUTC(ts, offset) {
  const utc = ts + new Date().getTimezoneOffset() * 60000;
  const local = new Date(utc + offset * 3600000);
  return local.toLocaleString();
}

function formatMessage(msg) {
  const hora = getFormattedDateUTC(msg.timestamp, UTC_OFFSET);
  const autor = msg.speaker?.alias || game.users.get(msg.user)?.name || "Desconhecido";

  const flavor = msg.flavor ? `<div><b>${msg.flavor}</b></div>` : "";
  const rolls = msg.rolls?.map(r => `<div><b>Rolagem:</b> ${r.total} <small>(${r.formula})</small></div>`).join("") || "";

  return `
    <div class="chat-entry">
      <div class="chat-time"><i class="fas fa-clock"></i> ${hora}</div>
      <div class="chat-author"><b>${autor}</b>:</div>
      ${flavor}
      <div>${msg.content}</div>
      ${rolls}
    </div>
  `;
}

class ChatTimestampFixPanel extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: MODULE_ID,
      title: "Chat UTC-3",
      template: `modules/${MODULE_ID}/templates/chat-panel.html`,
      width: 500,
      height: 600,
      resizable: true,
      classes: [MODULE_ID]
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    Hooks.on("createChatMessage", this._onNewMessage);
  }

  _onNewMessage = () => {
    if (this.rendered) this.render(true);
  };

  async getData() {
    const msgs = game.messages.contents.slice().sort((a, b) => a.timestamp - b.timestamp);
    return {
      messages: msgs.map(formatMessage).join("")
    };
  }

  close(options) {
    Hooks.off("createChatMessage", this._onNewMessage);
    return super.close(options);
  }
}

Hooks.once("ready", () => {
  game.modules.get(MODULE_ID).api = {
    open: () => new ChatTimestampFixPanel().render(true)
  };

  // Botão para abrir o painel no topo da interface
  Hooks.on("renderSceneControls", () => {
    if (document.querySelector(".chat-timestamp-fix-btn")) return;
    const button = document.createElement("button");
    button.innerHTML = "🕓 Chat UTC-3";
    button.classList.add("chat-timestamp-fix-btn");
    button.style.marginLeft = "10px";
    button.onclick = () => new ChatTimestampFixPanel().render(true);

    const controls = document.querySelector("#ui-top .control-tools");
    if (controls) controls.appendChild(button);
  });
});
