/**
 * Web Audio API synthesizer for clean notification chimes without external mp3 dependencies
 */
export function playNotificationSound(priority: "low" | "medium" | "high" | "critical" = "medium") {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (priority === "critical") {
      // Alarm double chime (High alert)
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.12); // D6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (priority === "high") {
      // Pleasant double chime (Notification)
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Soft subtle ping
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (err) {
    console.warn("Navegador bloqueou áudio automático de notificação:", err);
  }
}
