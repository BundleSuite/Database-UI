import localFont from "next/font/local";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { BackButtonWrapper } from "./components/navigation/back-button-wrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "BundleSuite Data",
  description: "BundleSuite Data",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader />
        <div className="container mx-auto py-4">
          <BackButtonWrapper />
        </div>
        {children}
      </body>
    </html>
  );
}
