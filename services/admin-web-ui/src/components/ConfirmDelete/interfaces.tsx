interface ConfirmDeleteProps {
  boxOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export type {
  ConfirmDeleteProps
};
