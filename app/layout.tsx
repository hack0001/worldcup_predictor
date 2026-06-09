import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 Predictor",
  description: "Predict scores, compete with mates",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#15803d",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WC 2026",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-root">
          {children}
        </div>
      </body>
    </html>
  );
}
