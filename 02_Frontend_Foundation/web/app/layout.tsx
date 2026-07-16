import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Simulator",
  description: "Advanced AI-powered mock interview practice for engineering and product roles.",
};

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
                const store = localStorage.getItem('theme-store');
                let theme = 'system';
                if (store) {
                  theme = JSON.parse(store).state.theme;
                }
                const root = document.documentElement;
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  root.setAttribute('data-theme', 'dark');
                  root.classList.add('dark');
                } else {
                  root.setAttribute('data-theme', 'light');
                  root.classList.remove('dark');
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
