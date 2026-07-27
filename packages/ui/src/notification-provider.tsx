"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type NotificationTone = "success" | "error" | "info";

type Notification = {
  id: number;
  title: string;
  message?: string;
  tone: NotificationTone;
};

type NotificationOptions = Omit<Notification, "id">;

type NotificationContextValue = {
  notify: (notification: NotificationOptions) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const toneStyles: Record<NotificationTone, { accent: string; icon: string }> = {
  success: { accent: "bg-[#006f67]", icon: "bg-[#006f67]/10 text-[#006f67]" },
  error: { accent: "bg-[#ba1a1a]", icon: "bg-[#ba1a1a]/10 text-[#ba1a1a]" },
  info: { accent: "bg-[#004ac6]", icon: "bg-[#004ac6]/10 text-[#004ac6]" },
};

export function NotificationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const notify = useCallback((notification: NotificationOptions) => {
    const id = Date.now();
    setNotifications((current) => [...current, { ...notification, id }]);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex w-auto flex-col gap-3 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-full sm:max-w-sm" aria-live="polite">
        {notifications.map((notification) => (
          <NotificationToast key={notification.id} notification={notification} onDismiss={dismiss} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider.");
  }

  return context;
}

function NotificationToast({ notification, onDismiss }: { notification: Notification; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(notification.id), 6000);
    return () => window.clearTimeout(timeout);
  }, [notification.id, onDismiss]);

  const style = toneStyles[notification.tone];
  return (
    <div className="pointer-events-auto overflow-hidden rounded-xl border border-[#c3c6d7]/50 bg-white shadow-[0_22px_50px_rgb(28_33_67_/_0.18)]" role={notification.tone === "error" ? "alert" : "status"}>
      <div className={`h-1 ${style.accent}`} />
      <div className="flex gap-3 p-4">
        <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${style.icon}`}>
          <NotificationIcon tone={notification.tone} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold tracking-[0.02em] text-[#191b23]">{notification.title}</p>
          {notification.message ? <p className="mt-1 text-sm leading-5 text-[#434655]">{notification.message}</p> : null}
        </div>
        <button className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-md text-[#737686] transition hover:bg-[#f3f3fe] hover:text-[#191b23]" type="button" aria-label="Dismiss notification" onClick={() => onDismiss(notification.id)}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function NotificationIcon({ tone }: { tone: NotificationTone }) {
  if (tone === "success") {
    return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="m8 12 2.5 2.5L16 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
  }

  if (tone === "error") {
    return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 8v5M12 16h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>;
  }

  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M12 11v5M12 8h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>;
}

function CloseIcon() {
  return <svg aria-hidden="true" className="size-[18px]" fill="none" viewBox="0 0 24 24"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg>;
}
