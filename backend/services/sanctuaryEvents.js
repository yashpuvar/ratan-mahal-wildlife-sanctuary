const { EventEmitter } = require("node:events");
const events = new EventEmitter();
events.setMaxListeners(0);

const notifySanctuaryChange = () => events.emit("change");
const streamSanctuaryChanges = (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.flushHeaders();
  const refresh = () => res.write('event: refresh\ndata: {}\n\n');
  refresh();
  const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 15000);
  heartbeat.unref?.();
  events.on("change", refresh);
  res.on("close", () => { clearInterval(heartbeat); events.off("change", refresh); });
};

module.exports = { notifySanctuaryChange, streamSanctuaryChanges };
