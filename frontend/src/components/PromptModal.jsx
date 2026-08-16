import { useEffect, useState } from "react";

function PromptModal({ open, title, label, defaultValue = "", confirmLabel = "Confirm", onCancel, onConfirm }) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card stack"
        style={{ width: 360 }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>

        <div className="stack" style={{ gap: 6 }}>
          {label && <label>{label}</label>}
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirm(value);
              if (e.key === "Escape") onCancel();
            }}
          />
        </div>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={() => onConfirm(value)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default PromptModal;