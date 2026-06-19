import { useEffect, useState } from "react";

// Tracks whether the viewport is in the mobile range (<768px), used to
// switch the Socratic Margin prompt between the desktop margin note and
// the mobile bottom sheet.
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
