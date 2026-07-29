"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../src/states/hooks";
import { clearSelectedWorkspace } from "../src/states/workspace-slice";

export function ClearWorkspaceSelection({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(clearSelectedWorkspace());
    document.cookie = "selectedWorkspaceId=;path=/;max-age=0";
  }, [dispatch]);
  return <>{children}</>;
}
