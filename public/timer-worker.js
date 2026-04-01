// Web Worker for background timer - keeps ticking even when screen is off
let timerId = null;
let endTime = 0;
let label = "";

self.onmessage = function(e) {
  const { type, seconds, timerLabel } = e.data;
  
  if (type === "start") {
    if (timerId) clearInterval(timerId);
    endTime = Date.now() + seconds * 1000;
    label = timerLabel || "";
    
    timerId = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      self.postMessage({ type: "tick", remaining, label });
      
      if (remaining <= 0) {
        clearInterval(timerId);
        timerId = null;
        self.postMessage({ type: "done", label });
      }
    }, 250); // Check every 250ms for accuracy
  }
  
  if (type === "stop") {
    if (timerId) clearInterval(timerId);
    timerId = null;
    self.postMessage({ type: "stopped" });
  }
};
