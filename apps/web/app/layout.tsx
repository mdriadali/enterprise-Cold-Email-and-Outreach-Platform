import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "@repo/ui/notification-provider";
import { ReduxProvider } from "./redux-provider";

export const metadata: Metadata = {
  title: "ColdReach AI",
  description: "ColdReach AI enterprise outreach platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
