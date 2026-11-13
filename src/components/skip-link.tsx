"use client";

import type { MouseEvent } from "react";

export function SkipLink({ label }: { label: string }) {
  function focusMain(event: MouseEvent<HTMLAnchorElement>) {
    const main = document.getElementById("main-content") ?? document.querySelector<HTMLElement>("main");
    if (!main) return;
    event.preventDefault();
    if (!main.id) main.id = "main-content";
    main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    main.scrollIntoView?.();
  }

  return (
    <a className="skip-link" href="#main-content" onClick={focusMain}>
      {label}
    </a>
  );
}