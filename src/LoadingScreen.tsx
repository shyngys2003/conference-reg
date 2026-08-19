import { useEffect, useState } from "react";
import "./LoadingScreen.css";

interface Props {
  onDone: () => void;
}

const AUTO_ADVANCE_MS = 3300;
const RING_DELAY_MS = 150;

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

  const ringStyle = {
    "--draw-duration": `${AUTO_ADVANCE_MS - RING_DELAY_MS}ms`,
    "--ring-delay": `${RING_DELAY_MS}ms`,
    "--breathe-delay": `${AUTO_ADVANCE_MS}ms`,
  } as React.CSSProperties;

  return (
    <div className={`loading-screen${leaving ? " leaving" : ""}`}>
      <div className="loading-photo" aria-hidden="true">
        <img src="/assets/school-building.jpg" alt="" />
      </div>
      <div className="loading-dust" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
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
            style={ringStyle}
          />
        </svg>
        <img src="/assets/logo.jpeg" alt="" className="seal-logo" />
      </div>

      <p className="loading-org">
        «№11 Жалпы орта білім беретін мектебі» КММ
      </p>
      <p className="loading-event">ТАМЫЗ КОНФЕРЕНЦИЯСЫ</p>

      <div
        className="loading-progress"
        role="status"
        aria-label="Жүктелуде"
        style={ringStyle}
      >
        <span className="loading-progress-fill" />
      </div>
    </div>
  );
}

export default LoadingScreen;
