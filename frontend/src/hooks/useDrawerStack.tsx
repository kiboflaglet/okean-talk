import { useEffect, useRef, useState } from "react";

export function useDrawerStack(count: number) {
  const [states, setStates] = useState<boolean[]>(() =>
    Array(count).fill(false)
  );
  const restoringCount = useRef(0);

  useEffect(() => {
    const handlePop = () => {
      if (restoringCount.current > 0) {
        restoringCount.current--;
        return;
      }

      setStates((prev) => {
        const topmostIdx = prev.lastIndexOf(true);
        if (topmostIdx === -1) return prev;
        const next = [...prev];
        next[topmostIdx] = false;
        return next;
      });
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const open = (index: number) => {
    setStates((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    history.pushState({ drawerLevel: index + 1 }, "");
  };

  const close = (index: number) => {
    const currentLevel = (history.state?.drawerLevel as number) ?? 0;
    const stepsBack = currentLevel - index;

    setStates((prev) => {
      const next = [...prev];
      for (let i = index; i < count; i++) next[i] = false;
      return next;
    });

    if (stepsBack > 0) {
      restoringCount.current += stepsBack;
      history.go(-stepsBack);
    }
  };

  const closeAll = () => {
    const currentLevel = (history.state?.drawerLevel as number) ?? 0;
    setStates(Array(count).fill(false));
    if (currentLevel > 0) {
      restoringCount.current += currentLevel;
      history.go(-currentLevel);
    }
  };

  return { states, open, close, closeAll };
}
