import { useState, useEffect, useReducer } from "react";

// ── Constants ──
const AGENTS = ["Gary", "Kane", "Kasano", "Katie", "Kaylee", "Kenny", "Kevin", "Lisa Marie", "Mary", "Nate", "Ryan", "Tim"];
const MOODS = ["🔥 Crushed it", "👍 Went well", "😐 Average", "👎 Rough one"];
const AUDIENCES = ["< 50", "50–100", "100–200", "200–500", "500+"];
const EVENT_TYPES = ["Corporate Event", "Public Show", "Theater / PAC", "Cruise Ship", "Community Event", "Banquet / Gala", "Holiday Party", "Wedding", "School / University", "Fair / Festival", "Trade Show", "Private Party", "Fundraiser", "Casino", "Club / Venue", "Other"];
const VENUE_STARS = [1, 2, 3, 4, 5];

// ── Brand Colors ──
const C = {
  bg: "#0c1220",
  card: "#141e30",
  cardBorder: "#1e2d44",
  input: "#1a2740",
  accent: "#3b9dff",
  accentGlow: "rgba(59,157,255,.35)",
  highlight: "#f5a623",
  highlightGlow: "rgba(245,166,35,.35)",
  green: "#22c55e",
  red: "#ef4444",
  textPrimary: "#f1f5f9",
  textSecondary: "#7a8ba5",
  textMuted: "#4a5d78",
};

const initialForm = {
  performerName: "",
  eventName: "",
  eventType: "",
  location: "",
  date: new Date().toISOString().split("T")[0],
  audience: "",
  agent: "",
  clientContact: "",
  contactedClient: null,
  setupShowtime: "",
  setupSmooth: null,
  providedAV: null,
  mood: "",
  clientHappy: null,
  wouldRepeat: null,
  venueRating: 0,
  sentThankYou: null,
  tookPhotos: null,
  notes: "",
};

function reducer(state, action) {
  if (action.type === "reset") return { ...initialForm, date: new Date().toISOString().split("T")[0], performerName: state.performerName };
  return { ...state, [action.field]: action.value };
}

function generateNotionMarkdown(r) {
  const d = new Date(r.date);
  const ds = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  return `## ${r.eventName}
**Performer:** ${r.performerName}
**Date:** ${ds}
**Type:** ${r.eventType || "N/A"}
**Location:** ${r.location}
**Agent:** ${r.agent}
**Client Contact:** ${r.clientContact || "N/A"}
**Audience:** ${r.audience}
**Contacted Client:** ${r.contactedClient ? "Yes" : "No"}
**Setup/Showtime:** ${r.setupShowtime || "N/A"}
**Setup Smooth:** ${r.setupSmooth ? "Yes" : "No"}
**Provided AV:** ${r.providedAV ? "Yes" : "No"}
**How It Went:** ${r.mood}
**Client Happy:** ${r.clientHappy ? "Yes" : "No"}
**Would Repeat:** ${r.wouldRepeat ? "Yes" : "No"}
**Venue Rating:** ${"★".repeat(r.venueRating || 0)}${"☆".repeat(5 - (r.venueRating || 0))}
**Took Photos:** ${r.tookPhotos ? "Yes" : "No"}
**Sent Thank You:** ${r.sentThankYou ? "Yes" : "No"}
${r.notes ? `**Notes:** ${r.notes}` : ""}

---`;
}

function generateEmailBody(r) {
  const d = new Date(r.date);
  const ds = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  return `Event Report: ${r.eventName}

Performer: ${r.performerName}
Date: ${ds}
Type: ${r.eventType || "N/A"}
Location: ${r.location}
Agent: ${r.agent}
Client Contact: ${r.clientContact || "N/A"}
Audience Size: ${r.audience}
Contacted Client in Advance: ${r.contactedClient ? "Yes" : "No"}
Setup/Showtime: ${r.setupShowtime || "N/A"}
Setup Went Smoothly: ${r.setupSmooth ? "Yes" : "No"}
Provided Sound & Lights: ${r.providedAV ? "Yes" : "No"}

Performance: ${r.mood}
Client Happy: ${r.clientHappy ? "Yes" : "No"}
Would Do Again: ${r.wouldRepeat ? "Yes" : "No"}
Venue Rating: ${"★".repeat(r.venueRating || 0)}${"☆".repeat(5 - (r.venueRating || 0))}
Photos Taken: ${r.tookPhotos ? "Yes" : "No"}
Sent Thank You: ${r.sentThankYou ? "Yes" : "No"}
${r.notes ? `\nNotes: ${r.notes}` : ""}`;
}

// ── UI Components ──

function Toggle({ value, onChange, labelYes = "Yes", labelNo = "No" }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[true, false].map((v) => (
        <button key={String(v)} onClick={() => onChange(v)} style={{
          flex: 1, padding: "10px 0", border: "none", borderRadius: 10,
          fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "all .15s",
          background: value === v ? (v ? C.green : C.red) : C.input,
          color: value === v ? "#fff" : C.textSecondary,
          boxShadow: value === v ? `0 0 12px ${v ? "rgba(34,197,94,.35)" : "rgba(239,68,68,.35)"}` : "none",
        }}>{v ? labelYes : labelNo}</button>
      ))}
    </div>
  );
}

function ChipSelect({ options, value, onChange, columns = 3, color = C.accent, glow = C.accentGlow }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 6 }}>
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: "10px 6px", border: "none", borderRadius: 10,
          fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all .15s",
          background: value === opt ? color : C.input,
          color: value === opt ? "#fff" : C.textSecondary,
          boxShadow: value === opt ? `0 0 14px ${glow}` : "none",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{opt}</button>
      ))}
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {VENUE_STARS.map((s) => (
        <button key={s} onClick={() => onChange(s)} style={{
          background: "none", border: "none", fontSize: 30, cursor: "pointer",
          color: s <= value ? C.highlight : C.textMuted, transition: "all .15s",
          padding: 2, filter: s <= value ? `drop-shadow(0 0 6px ${C.highlightGlow})` : "none",
        }}>★</button>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.textSecondary, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.2 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
      width: "100%", padding: "12px 14px", border: `1px solid ${C.cardBorder}`, borderRadius: 10,
      fontSize: 16, background: C.input, color: C.textPrimary, outline: "none",
      boxSizing: "border-box", height: 46, WebkitAppearance: "none", MozAppearance: "none",
      appearance: "none", lineHeight: "normal", colorScheme: "dark",
    }} />
  );
}

function Dropdown({ value, onChange, options, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        width: "100%", padding: "12px 14px", paddingRight: 40,
        border: `1px solid ${C.cardBorder}`, borderRadius: 10,
        fontSize: 16, background: C.input, color: value ? C.textPrimary : C.textMuted,
        outline: "none", boxSizing: "border-box", height: 46,
        WebkitAppearance: "none", MozAppearance: "none", appearance: "none",
        cursor: "pointer",
      }}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div style={{
        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
        pointerEvents: "none", color: C.textSecondary, fontSize: 12,
      }}>▼</div>
    </div>
  );
}

function LogCard({ report, onEmail, onCopy, onDelete }) {
  const d = new Date(report.date);
  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const moodEmoji = report.mood?.split(" ")[0] || "📋";
  return (
    <div style={{
      background: C.card, borderRadius: 14, padding: "14px 16px", marginBottom: 10,
      display: "flex", alignItems: "center", gap: 12, border: `1px solid ${C.cardBorder}`,
    }}>
      <div style={{ fontSize: 28, lineHeight: 1 }}>{moodEmoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {report.eventName || "Untitled Event"}
        </div>
        <div style={{ fontSize: 13, color: C.textMuted }}>
          {dateStr} · {report.performerName || "Unknown"} · {report.location || "No location"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onEmail} title="Email" style={iconBtn}>✉️</button>
        <button onClick={onCopy} title="Copy for Notion" style={iconBtn}>📋</button>
        <button onClick={onDelete} title="Delete" style={{ ...iconBtn, opacity: 0.5 }}>🗑️</button>
      </div>
    </div>
  );
}

const iconBtn = { background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4, borderRadius: 6, lineHeight: 1 };

function Section({ label, color = C.accent, children }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.card} 0%, ${C.bg} 100%)`,
      borderRadius: 16, padding: "18px 16px", marginBottom: 16,
      border: `1px solid ${C.cardBorder}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color, marginBottom: 14, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 20px 4px" }}>
      <div style={{
        position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
        padding: "14px 28px", borderRadius: 8,
        background: "linear-gradient(145deg, #1c1c30 0%, #101020 100%)",
        border: "2px solid #444",
        transform: "rotate(-2deg)",
        marginBottom: 2,
      }}>
        <div style={{ position: "absolute", left: -7, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", background: C.bg }} />
        <div style={{ position: "absolute", right: -7, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", background: C.bg }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: 3, lineHeight: 1 }}>glberg</div>
          <div style={{ fontSize: 10, fontWeight: 400, color: "#bbb", letterSpacing: 4, marginTop: 3 }}>entertainment</div>
        </div>
      </div>
      <div style={{
        fontSize: 20, fontWeight: 800, color: C.highlight,
        marginTop: 10, letterSpacing: 1,
      }}>Event Report</div>
    </div>
  );
}

// ══════════════════════════════════
// MAIN APP
// ══════════════════════════════════

export default function EventReportApp() {
  const [form, dispatch] = useReducer(reducer, initialForm);
  const [reports, setReports] = useState([]);
  const [view, setView] = useState("form");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("glberg-event-reports");
        if (result?.value) setReports(JSON.parse(result.value));
      } catch (e) {}
      try {
        const pn = await window.storage.get("glberg-performer-name");
        if (pn?.value) dispatch({ field: "performerName", value: pn.value });
      } catch (e) {}
    })();
  }, []);

  const persist = async (updated) => {
    try { await window.storage.set("glberg-event-reports", JSON.stringify(updated)); } catch (e) {}
  };

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const set = (field) => (value) => dispatch({ field, value });

  const isValid = form.performerName && form.eventName && form.date && form.agent;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try { await window.storage.set("glberg-performer-name", form.performerName); } catch (e) {}
    const updated = [{ ...form, id: Date.now() }, ...reports];
    setReports(updated);
    await persist(updated);
    dispatch({ type: "reset" });
    setSaving(false);
    flash("Report saved ✓");
  };

  const handleDelete = async (id) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    await persist(updated);
    flash("Deleted");
  };

  const handleEmail = (report) => {
    const subject = encodeURIComponent(`Event Report: ${report.eventName}`);
    const body = encodeURIComponent(generateEmailBody(report));
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleCopyNotion = (report) => {
    navigator.clipboard.writeText(generateNotionMarkdown(report)).then(() => flash("Copied for Notion ✓")).catch(() => flash("Copy failed"));
  };

  const handleExportAll = () => {
    navigator.clipboard.writeText(reports.map(generateNotionMarkdown).join("\n")).then(() => flash("All reports copied ✓")).catch(() => flash("Copy failed"));
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.textPrimary,
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      maxWidth: 480, margin: "0 auto", position: "relative",
    }}>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        input::placeholder { color: ${C.textMuted}; }
        textarea::placeholder { color: ${C.textMuted}; }
        select option { background: ${C.input}; color: ${C.textPrimary}; }
      `}</style>

      <Logo />

      <div style={{ display: "flex", gap: 4, padding: "12px 20px 0", justifyContent: "center" }}>
        {["form", "log"].map((v) => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "10px 28px", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all .15s",
            background: view === v ? C.accent : C.input,
            color: view === v ? "#fff" : C.textMuted,
            boxShadow: view === v ? `0 2px 12px ${C.accentGlow}` : "none",
          }}>{v === "form" ? "New Report" : `Log (${reports.length})`}</button>
        ))}
      </div>

      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: C.green, color: "#fff", padding: "10px 24px", borderRadius: 12,
          fontWeight: 700, fontSize: 15, zIndex: 999,
          boxShadow: "0 4px 20px rgba(34,197,94,.4)", animation: "slideDown .2s ease",
        }}>{toast}</div>
      )}

      {view === "form" && (
        <div style={{ padding: "16px 20px 100px" }}>
          <Section label="Performer" color={C.highlight}>
            <Field label="Your Name">
              <TextInput value={form.performerName} onChange={set("performerName")} placeholder="e.g. Noah Levine" />
            </Field>
          </Section>

          <Section label="Event Details" color={C.accent}>
            <Field label="Event Name">
              <TextInput value={form.eventName} onChange={set("eventName")} placeholder="e.g. Johnson Wedding" />
            </Field>
            <Field label="Event Type">
              <Dropdown value={form.eventType} onChange={set("eventType")} options={EVENT_TYPES} placeholder="Select event type..." />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Location">
                <TextInput value={form.location} onChange={set("location")} placeholder="Venue / City" />
              </Field>
              <Field label="Date">
                <TextInput type="date" value={form.date} onChange={set("date")} />
              </Field>
            </div>
            <Field label="Audience Size">
              <ChipSelect options={AUDIENCES} value={form.audience} onChange={set("audience")} columns={5} color={C.accent} glow={C.accentGlow} />
            </Field>
            <Field label="Booking Agent">
              <Dropdown value={form.agent} onChange={set("agent")} options={AGENTS} placeholder="Select agent..." />
            </Field>
            <Field label="Client Contact / Company">
              <TextInput value={form.clientContact} onChange={set("clientContact")} placeholder="e.g. Sarah Miller / Acme Corp" />
            </Field>
          </Section>

          <Section label="Quick Checks" color={C.highlight}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Contacted Client?"><Toggle value={form.contactedClient} onChange={set("contactedClient")} /></Field>
              <Field label="Setup Smooth?"><Toggle value={form.setupSmooth} onChange={set("setupSmooth")} /></Field>
              <Field label="Provided AV?"><Toggle value={form.providedAV} onChange={set("providedAV")} /></Field>
              <Field label="Client Happy?"><Toggle value={form.clientHappy} onChange={set("clientHappy")} /></Field>
              <Field label="Would Repeat?"><Toggle value={form.wouldRepeat} onChange={set("wouldRepeat")} /></Field>
              <Field label="Sent Thank You?"><Toggle value={form.sentThankYou} onChange={set("sentThankYou")} /></Field>
              <Field label="Took Photos?"><Toggle value={form.tookPhotos} onChange={set("tookPhotos")} /></Field>
            </div>
          </Section>

          <Section label="The Vibe" color={C.accent}>
            <Field label="How'd it go?">
              <ChipSelect options={MOODS} value={form.mood} onChange={set("mood")} columns={2} color={C.highlight} glow={C.highlightGlow} />
            </Field>
            <Field label="Venue Rating">
              <StarRating value={form.venueRating} onChange={set("venueRating")} />
            </Field>
            <Field label="Setup Time / Showtime">
              <TextInput value={form.setupShowtime} onChange={set("setupShowtime")} placeholder="e.g. Setup 4:30 / Show 7:00" />
            </Field>
            <Field label="Notes">
              <textarea value={form.notes} onChange={(e) => set("notes")(e.target.value)}
                placeholder="Anything worth remembering..." rows={3}
                style={{
                  width: "100%", padding: "12px 14px", border: `1px solid ${C.cardBorder}`,
                  borderRadius: 10, fontSize: 16, background: C.input, color: C.textPrimary,
                  outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }} />
            </Field>
          </Section>

          <button onClick={handleSave} disabled={!isValid || saving} style={{
            width: "100%", padding: "16px", border: "none", borderRadius: 14,
            fontSize: 17, fontWeight: 800, cursor: isValid ? "pointer" : "not-allowed",
            background: isValid ? `linear-gradient(135deg, ${C.accent} 0%, ${C.highlight} 100%)` : "#1e2d44",
            color: isValid ? "#fff" : C.textMuted,
            boxShadow: isValid ? `0 4px 20px ${C.accentGlow}` : "none",
            transition: "all .2s", letterSpacing: 0.5,
          }}>{saving ? "Saving..." : "Save Report"}</button>
          {!isValid && (
            <div style={{ textAlign: "center", fontSize: 13, color: C.textMuted, marginTop: 8 }}>
              Fill in your name, event name, date & agent to save
            </div>
          )}
        </div>
      )}

      {view === "log" && (
        <div style={{ padding: "16px 20px 40px" }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMuted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No reports yet</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Tap "New Report" to log your first event</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button onClick={handleExportAll} style={{
                  padding: "8px 16px", border: `1px solid ${C.cardBorder}`, borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", background: "transparent", color: C.textSecondary,
                }}>📋 Copy All for Notion</button>
              </div>
              {reports.map((r) => (
                <LogCard key={r.id} report={r} onEmail={() => handleEmail(r)} onCopy={() => handleCopyNotion(r)} onDelete={() => handleDelete(r.id)} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
