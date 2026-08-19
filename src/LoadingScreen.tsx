import { useEffect, useState } from "react";
import "./LoadingScreen.css";

interface Props {
  onDone: () => void;
}

const AUTO_ADVANCE_MS = 2200;

function LoadingScreen({ onDone }: Props) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const finish = setTimeout(() => setLeaving(true), AUTO_ADVANCE_MS);
    return () => clearTimeout(finish);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 480);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div className={`loading-screen${leaving ? " leaving" : ""}`}>
      <div className="loading-photo" aria-hidden="true">
        <img src="/assets/school-building.jpg" alt="" />
      </div>
      <div className="loading-ornament top" aria-hidden="true" />
      <div className="seal-wrap">
        <svg className="seal-ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle
            className="seal-ring-track"
            cx="100"
            cy="100"
            r="92"
            fill="none"
          />
          <circle
            className="seal-ring-draw"
            cx="100"
            cy="100"
            r="92"
            fill="none"
          />
        </svg>
        <img src="/assets/logo.jpeg" alt="" className="seal-logo" />
      </div>

      <p className="loading-org">
        «№11 Жалпы орта білім беретін мектебі» КММ
      </p>
      <p className="loading-event">ТАМЫЗ КОНФЕРЕНЦИЯСЫ</p>

      <div className="loading-dots" role="status" aria-label="Жүктелуде">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default LoadingScreen;
