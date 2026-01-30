import "../../styles/global.css";
import { Metadata, Viewport } from "next";
import { ensureFfmpegAvailable } from "../server/ffmpeg";

ensureFfmpegAvailable().catch((error) => {
  console.error("[ffmpeg] availability check failed", error);
});

export const metadata: Metadata = {
  title: "Remotion and Next.js",
  description: "Remotion and Next.js",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background">{children}</body>
    </html>
  );
}
