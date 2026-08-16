function ConfirmModal({ open, title, message, confirmLabel = "Confirm", danger = true, onCancel, onConfirm }) {
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

        {message && <p className="text-muted" style={{ margin: 0 }}>{message}</p>}

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;