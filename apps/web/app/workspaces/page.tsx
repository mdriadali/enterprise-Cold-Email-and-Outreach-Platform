import { WorkspaceList } from "@repo/ui/workspace-list";
import { PlusCircle } from "lucide-react";

import { requireSession } from "../src/auth/require-session";
import { getCurrentUserProfile } from "../src/actions/auth/profile";

export const metadata = { title: "Workspaces | ColdReach AI", description: "Manage your ColdReach AI workspaces." };

export default async function WorkspacesPage() {
  await requireSession();
  const profile = await getCurrentUserProfile();

  if (profile.status === "error") {
    return <main className="bg-[#faf8ff] p-8 text-[#191b23] min-h-svh"><div className="mx-auto max-w-[1000px]"><p className="text-[#8b1e1e]">{profile.message}</p></div></main>;
  }

  return (
    <main className="bg-[#faf8ff] p-8 text-[#191b23] min-h-svh">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23]">Your Workspaces</h2>
          <button className="flex items-center gap-1 text-[#004ac6] text-sm leading-5 font-semibold tracking-[0.05em] hover:bg-[#dbe1ff] px-4 py-2 rounded-lg transition-all active:scale-95" type="button">
            <PlusCircle className="size-5" />
            Create New Workspace
          </button>
        </div>
        <WorkspaceList workspaces={profile.data.workspaceMember} />
      </div>
    </main>
  );
}
