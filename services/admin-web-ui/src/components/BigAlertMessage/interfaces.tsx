interface AlertProps {
  boxOpen: boolean;
  onClose: () => void;
  header?: string;
  message?: string;
}

export type {
  AlertProps
};
