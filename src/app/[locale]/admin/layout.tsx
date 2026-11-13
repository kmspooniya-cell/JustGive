import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin — JustGive", template: "%s — JustGive" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}