// ConfirmDialog.tsx
import { createRoot } from "react-dom/client";
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";

export function showConfirmDialog({
  question,
  onYes,
  onNo,
}: {
  question: string;
  onYes?: () => void;
  onNo?: () => void;
}) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);

  const handleClose = () => {
    root.unmount();
    container.remove();
  };

  const handleYes = () => {
    onYes?.();
    handleClose();
  };

  const handleNo = () => {
    onNo?.();
    handleClose();
  };

  root.render(
    <Dialog open={true} onClose={handleNo}>
      <DialogTitle>{question}</DialogTitle>
      <DialogActions>
        <Button onClick={handleNo} color="secondary">
          No
        </Button>
        <Button onClick={handleYes} color="primary" autoFocus>
          Sí
        </Button>
      </DialogActions>
    </Dialog>,
  );
}
