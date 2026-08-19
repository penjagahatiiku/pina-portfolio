import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PINA subholding — IT Consultant & Software House",
  description:
    "PINA subholding menghadirkan solusi digital inovatif. Website development, mobile apps, UI/UX design, dan IT consulting dengan teknologi terdepan.",
  keywords: [
    "PINA subholding",
    "IT Consultant",
    "Software House",
    "Web Development",
    "Mobile App",
    "UI/UX Design",
    "Indonesia",
  ],
  openGraph: {
    title: "PINA subholding — IT Consultant & Software House",
    description:
      "Menghadirkan solusi digital inovatif dengan desain futuristik dan teknologi terdepan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
