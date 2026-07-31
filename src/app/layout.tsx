import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fieldnotes | Local Research",
  description: "Read-only portal for a local Markdown research library.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
