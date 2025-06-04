import { useEffect, useState } from "react";

export function useBreakpoint(breakpoint = 640) {
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsBelow(window.innerWidth < breakpoint);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isBelow;
}
