import { useEffect } from "react";

export function useBackButtonClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modal: true }, "");
    }
  }, [isOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) onClose();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isOpen, onClose]);
}