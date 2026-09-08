"use client";

import * as React from "react";
import { cn } from "./utils";

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue);
  const activeTab = value ?? internal;

  const setActiveTab = React.useCallback(
    (v: string) => {
      if (!value) setInternal(v);
      onValueChange?.(v);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border-b border-[#c3c6d7]",
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  count?: number;
}

function TabsTrigger({
  value,
  icon,
  count,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "border-b-2 border-[#004ac6] text-[#004ac6] font-semibold"
          : "border-b-2 border-transparent text-[#434655] hover:text-[#191b23]",
        className
      )}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span
          className={cn(
            "ml-1 px-1.5 py-0.5 text-xs rounded-full",
            isActive
              ? "bg-[#dbe1ff] text-[#00174b]"
              : "bg-[#ededf9] text-[#737686]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div className={cn("mt-4", className)} role="tabpanel" {...props}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
