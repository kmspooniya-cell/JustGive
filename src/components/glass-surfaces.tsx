import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article";
  children: ReactNode;
  variant?: "soft" | "raised" | "quiet";
};

export function GlassPanel({ as: Element = "section", className = "", variant = "raised", ...props }: SurfaceProps) {
  return <Element className={`glass-panel glass-panel-${variant} ${className}`.trim()} {...props} />;
}

export function GlassCard({ className = "", ...props }: HTMLAttributes<HTMLElement> & { as?: "div" | "article" }) {
  const { as: Element = "article", ...rest } = props;
  return <Element className={`glass-card ${className}`.trim()} {...rest} />;
}

export function GlassButton({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`glass-button ${className}`.trim()} {...props} />;
}

export function GlassInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`glass-input ${className}`.trim()} {...props} />;
}
