import { useState } from "react";
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

function App() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);
  const [regNumber, setRegNumber] = useState<number | null>(null);
  const [submittedName, setSubmittedName] = useState("");

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

  const fieldClass = (field: keyof FormState) =>
    errors[field] ? "invalid" : form[field].trim().length > 0 ? "valid" : "";

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
      setSuccess(true);
    } catch {
      setSubmitError(
        "Тіркеу кезінде қате пайда болды. Интернет байланысын тексеріп, қайталап көріңіз."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitError("");
    setRegNumber(null);
    setSubmittedName("");
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="page">
        <div className="card success-card">
          <span className="corner corner-tl" aria-hidden="true" />
          <span className="corner corner-tr" aria-hidden="true" />
          <span className="corner corner-bl" aria-hidden="true" />
          <span className="corner corner-br" aria-hidden="true" />

          <div className="check-mark" aria-hidden="true">
            <svg viewBox="0 0 52 52">
              <circle className="check-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="check-path" fill="none" d="M14 27l7 7 17-17" />
            </svg>
          </div>
          <h1 className="success-title">ТІРКЕУ СӘТТІ АЯҚТАЛДЫ!</h1>

          {submittedName && <p className="success-name">{submittedName}</p>}

          {regNumber !== null && (
            <div className="success-number">
              <span className="success-number-label">Тіркеу нөмірі</span>
              <span className="success-number-value">
                №{String(regNumber).padStart(3, "0")}
              </span>
            </div>
          )}

          <p className="success-text">
            Құрметті қатысушы, конференцияға тіркелуіңіз қабылданды.
          </p>
          <p className="success-thanks">Сізге рақмет!</p>

          <button type="button" className="reset-btn" onClick={handleReset}>
            Жаңа тіркеу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
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
          Білім беру қызметкерлерінің
          <br />
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
            <input
              type="text"
              value={form.fullName}
              onChange={handleChange("fullName")}
              placeholder="Толық аты-жөніңізді енгізіңіз"
              className={fieldClass("fullName")}
              autoComplete="name"
            />
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </label>

          <label className="field">
            <span className="field-label">Жұмыс орны</span>
            <input
              type="text"
              value={form.workplace}
              onChange={handleChange("workplace")}
              placeholder="Мекеме атауын енгізіңіз"
              className={fieldClass("workplace")}
            />
            {errors.workplace && <span className="error">{errors.workplace}</span>}
          </label>

          <label className="field">
            <span className="field-label">Лауазымы</span>
            <input
              type="text"
              value={form.position}
              onChange={handleChange("position")}
              placeholder="Лауазымыңызды енгізіңіз"
              className={fieldClass("position")}
            />
            {errors.position && <span className="error">{errors.position}</span>}
          </label>

          {submitError && <p className="submit-error">{submitError}</p>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting && <span className="btn-spinner" aria-hidden="true" />}
            <span>{submitting ? "ЖІБЕРІЛУДЕ..." : "ТІРКЕЛУ"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
