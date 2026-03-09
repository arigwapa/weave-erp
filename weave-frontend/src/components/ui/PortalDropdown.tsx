// PortalDropdown.tsx - dropdown menu rendered into document.body via portal

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface PortalDropdownProps {
  isOpen: boolean;
  children: React.ReactNode;
  minWidth?: number;
  align?: "left" | "right";
}

const PortalDropdown: React.FC<PortalDropdownProps> = ({
  isOpen,
  children,
  minWidth = 192,
  align = "left",
}) => {
  const markerRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const reposition = useCallback(() => {
    const container = markerRef.current?.parentElement;
    if (!container) return;
    const r = container.getBoundingClientRect();
    setPos({
      top: r.bottom + 8,
      left: align === "right" ? r.right - minWidth : r.left,
    });
  }, [align, minWidth]);

  useEffect(() => {
    if (!isOpen) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen, reposition]);

  return (
    <>
      <span ref={markerRef} className="sr-only" aria-hidden="true" />
      {isOpen &&
        createPortal(
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] border border-slate-200 dark:border-slate-700"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              minWidth,
              zIndex: 9999,
            }}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
};

export default PortalDropdown;
