import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
try {
  var theme = localStorage.getItem("assertive-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (theme === "dark" || (!theme && prefersDark)) {
    document.documentElement.classList.add("dark");
  }
} catch {}
`,
          }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
