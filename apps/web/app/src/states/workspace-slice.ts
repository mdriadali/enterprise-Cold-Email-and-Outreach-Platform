import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "selectedWorkspaceId";

function load(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function save(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export type SelectedWorkspace = { id: string; name: string };

export type WorkspaceState = {
  selectedWorkspace: SelectedWorkspace | null;
};

const savedId = load();

const initialState: WorkspaceState = {
  selectedWorkspace: savedId ? { id: savedId, name: "" } : null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    selectWorkspace(state, action: PayloadAction<SelectedWorkspace>) {
      state.selectedWorkspace = action.payload;
      save(action.payload.id);
    },
    clearSelectedWorkspace(state) {
      state.selectedWorkspace = null;
      save(null);
    },
  },
});

export const { selectWorkspace, clearSelectedWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
