import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import LoadingScreen from "./LoadingScreen";
import { APPS_SCRIPT_URL } from "./config";
import "./App.css";

interface FormState {
  fullName: string;
  workplace: string;
  position: string;
}

interface FormErrors {
  fullName?: string;
  workplace?: string;
  position?: string;
}

const initialForm: FormState = { fullName: "", workplace: "", position: "" };

type Phase = "form" | "morphing" | "exiting" | "success";

const CONFETTI_COLORS = ["#e4c874", "#b08d2f", "#1b4332", "#fbfaf7", "#e4c874"];

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  color: string;
  size: number;
  shape: "circle" | "rect";
}

function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.25,
    duration: 1.1 + Math.random() * 0.9,
    drift: (Math.random() - 0.5) * 120,
    rotate: Math.random() * 360,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 5 + Math.random() * 5,
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }));
}

function App() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [shakeFields, setShakeFields] = useState(false);
  const fieldRefs = useRef<Record<keyof FormState, HTMLInputElement | null>>({
    fullName: null,
    workplace: null,
    position: null,
  });
  const [phase, setPhase] = useState<Phase>("form");
  const [regNumber, setRegNumber] = useState<number | null>(null);
  const [displayNumber, setDisplayNumber] = useState(0);
  const [submittedName, setSubmittedName] = useState("");
  const confetti = useMemo(() => makeConfetti(34), []);
  const rafRef = useRef<number | null>(null);

  // Count-up animation for the registration number once we enter the success phase.
  useEffect(() => {
    if (phase !== "success" || regNumber === null) return;
    const duration = 700;
    const start = performance.now();
    const from = 0;
    const to = regNumber;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setDisplayNumber(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, regNumber]);

  if (loading) {
    return <LoadingScreen onDone={() => setLoading(false)} />;
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (form.fullName.trim().length < 3) {
      next.fullName = "Аты-жөніңізді толық енгізіңіз (кемінде 3 таңба)";
    }
    if (form.workplace.trim().length === 0) {
      next.workplace = "Жұмыс орнын енгізіңіз";
    }
    if (form.position.trim().length === 0) {
      next.position = "Лауазымыңызды енгізіңіз";
    }
    return next;
  };

  const fieldClass = (field: keyof FormState) => {
    const classes = errors[field] ? ["invalid"] : form[field].trim().length > 0 ? ["valid"] : [];
    if (errors[field] && shakeFields) classes.push("shake");
    return classes.join(" ");
  };

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShakeFields(false);
      window.requestAnimationFrame(() => setShakeFields(true));
      window.setTimeout(() => setShakeFields(false), 460);

      const firstInvalid = (Object.keys(nextErrors) as Array<keyof FormState>)[0];
      window.setTimeout(() => fieldRefs.current[firstInvalid]?.focus(), 0);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          workplace: form.workplace.trim(),
          position: form.position.trim(),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Белгісіз қате");
      setSubmittedName(form.fullName.trim());
      setRegNumber(typeof data.number === "number" ? data.number : null);

      // Wow-sequence: button morphs into a checkmark, the form card then
      // dissolves away, and the success card rises in with confetti.
      setSubmitting(false);
      setPhase("morphing");
      window.setTimeout(() => setPhase("exiting"), 700);
      window.setTimeout(() => setPhase("success"), 700 + 420);
    } catch {
      setSubmitError(
        "Тіркеу кезінде қате пайда болды. Интернет байланысын тексеріп, қайталап көріңіз."
      );
      setSubmitting(false);
    }
  };

  if (phase === "success") {
    return (
      <div className="page">
        <div className="confetti-layer" aria-hidden="true">
          {confetti.map((p) => (
            <span
              key={p.id}
              className={`confetti-piece confetti-${p.shape}`}
              style={
                {
                  left: `${p.left}%`,
                  background: p.color,
                  width: `${p.size}px`,
                  height: p.shape === "rect" ? `${p.size * 0.4}px` : `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  "--drift": `${p.drift}px`,
                  "--rot": `${p.rotate}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className="card success-card">
          <span className="corner corner-tl" aria-hidden="true" />
          <span className="corner corner-tr" aria-hidden="true" />
          <span className="corner corner-bl" aria-hidden="true" />
          <span className="corner corner-br" aria-hidden="true" />

          <div className="success-glow" aria-hidden="true" />

          <div className="check-mark check-mark-burst" aria-hidden="true">
            <svg viewBox="0 0 52 52">
              <circle className="check-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="check-path" fill="none" d="M14 27l7 7 17-17" />
            </svg>
          </div>
          <h1 className="success-title">ТІРКЕУ СӘТТІ АЯҚТАЛДЫ!</h1>

          {submittedName && <p className="success-name">{submittedName}</p>}

          {regNumber !== null && (
            <div className="success-number stamp-in">
              <span className="success-number-label">Тіркеу нөмірі</span>
              <span className="success-number-value">
                №{String(displayNumber).padStart(3, "0")}
              </span>
            </div>
          )}

          <p className="success-text">
            Құрметті қатысушы, конференцияға тіркелуіңіз қабылданды.
          </p>
          <p className="success-thanks">Сізге рақмет!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className={`card${phase === "exiting" ? " card-exit" : ""}`}>
        <div className="card-banner">
          <img src="/assets/school-building.jpg" alt="Мектеп ғимараты" />
        </div>

        <span className="corner corner-tl" aria-hidden="true" />
        <span className="corner corner-tr" aria-hidden="true" />
        <span className="corner corner-bl" aria-hidden="true" />
        <span className="corner corner-br" aria-hidden="true" />

        <div className="org-header">
          <div className="logo-wrap">
            <img
              src="/assets/logo.jpeg"
              alt="№11 Жалпы орта білім беретін мектебі"
              className="logo"
            />
          </div>
          <p className="org-name">«№11 Жалпы орта білім беретін мектебі» КММ</p>
        </div>

        <div className="divider" aria-hidden="true">
          <span />
          <em>❦</em>
          <span />
        </div>

        <h1 className="event-title">
          <span className="event-title-eyebrow">Білім беру қызметкерлерінің</span>
          <span className="event-title-accent">Тамыз конференциясы</span>
        </h1>

        <div className="theme-box">
          <p className="theme-label">Тақырыбы</p>
          <p className="theme-text">
            Жаңа халықтық конституцияның нормалары мен құндылықтары:
            <br />
            Адами капиталды дамыту – білім беру жүйесінің стратегиялық негізі
          </p>
        </div>

        <form className="reg-form" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Аты-жөні</span>
            <span className="input-wrap">
              <input
                type="text"
                ref={(el) => { fieldRefs.current.fullName = el; }}
                value={form.fullName}
                onChange={handleChange("fullName")}
                placeholder="Толық аты-жөніңізді енгізіңіз"
                className={fieldClass("fullName")}
                autoComplete="name"
              />
            <svg className="field-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="6.5" r="3.25" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M3.5 17c0-3.31 2.91-6 6.5-6s6.5 2.69 6.5 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              </span>
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </label>

          <label className="field">
            <span className="field-label">Жұмыс орны</span>
            <span className="input-wrap">
              <input
                type="text"
                ref={(el) => { fieldRefs.current.workplace = el; }}
                value={form.workplace}
                onChange={handleChange("workplace")}
                placeholder="Мекеме атауын енгізіңіз"
                className={fieldClass("workplace")}
              />
            <svg className="field-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <rect x="3" y="7" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h3A1.5 1.5 0 0 1 13 5.5V7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M3 11h14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              </span>
            {errors.workplace && <span className="error">{errors.workplace}</span>}
          </label>

          <label className="field">
            <span className="field-label">Лауазымы</span>
            <span className="input-wrap">
              <input
                type="text"
                ref={(el) => { fieldRefs.current.position = el; }}
                value={form.position}
                onChange={handleChange("position")}
                placeholder="Лауазымыңызды енгізіңіз"
                className={fieldClass("position")}
              />
            <svg className="field-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 3l1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6L10 3z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
              </span>
            {errors.position && <span className="error">{errors.position}</span>}
          </label>

          {submitError && <p className="submit-error">{submitError}</p>}

          <button
            type="submit"
            className={`submit-btn${phase === "morphing" ? " morphing" : ""}`}
            disabled={submitting || phase === "morphing"}
          >
            {submitting && <span className="btn-spinner" aria-hidden="true" />}
            <span className="btn-label">
              {submitting ? "ЖІБЕРІЛУДЕ..." : "ТІРКЕЛУ"}
            </span>
            <svg
              className="btn-check"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                className="btn-check-path"
                fill="none"
                d="M5 12.5l4.5 4.5L19 7"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
