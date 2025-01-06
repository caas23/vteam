interface AlertProps {
  boxOpen: boolean;
  onClose: () => void;
  header?: string;
  message?: string;
  onSubmitReason: (reason: string) => void;
}

export type {
  AlertProps
};
