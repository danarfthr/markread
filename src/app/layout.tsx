import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/*
 * "T1 Sans" is proprietary and not installable. Inter is the substitute
 * DESIGN.md explicitly sanctions for its "geometric neutrality".
 * Weight 300 must be requested explicitly — it carries every display headline.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Markread",
  description:
    "Paste or drop Markdown and read the rendered result. Everything runs in your browser; nothing is uploaded.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      {/*
       * id="top" is the footer's "Back to top" target. It lives on <body>
       * because that is the true top of the document — nothing sits above it,
       * so the link lands at scroll 0 with no scroll-mt offset needed.
       */}
      <body id="top" className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
