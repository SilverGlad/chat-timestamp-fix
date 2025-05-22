Hooks.on("preCreateChatMessage", (message, options, userId) => {
  if (!game.user.isGM) return;
  message.updateSource({ timestamp: Date.now() });
});