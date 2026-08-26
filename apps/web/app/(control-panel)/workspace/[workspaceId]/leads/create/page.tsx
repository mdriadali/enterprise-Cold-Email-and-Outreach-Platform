import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getWorkspaceInfo } from "../../../../../src/actions/workspace/workspace-info";
import { CreateLeadClient } from "./create-lead-client";
import { CreateLeadBulkClient } from "./create-lead-bulk-client";

export const metadata = { title: "Add Prospect | ColdReach AI" };

export default async function CreateLeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ mode?: string; import?: string }>;
}) {
  const { workspaceId } = await params;
  const sp = await searchParams;
  const mode = sp.mode ?? sp.import; // import=csv → bulk mode
  const result = await getWorkspaceInfo(workspaceId);

  if (result.status === "error") {
    if (result.code === "NOT_WORKSPACE_MEMBER") redirect("/workspaces");
    notFound();
  }

  const { info } = result.data;
  const jobs = info.generationJob.filter((j) => j.status === "PENDING");

  const isBulk = mode === "bulk" || mode === "csv";

  return (
    <div className="min-h-0 flex-1 flex flex-col">
      <div className="flex items-center gap-[16px] px-[32px] pt-[24px] pb-0">
        <Link
          href={`/workspace/${workspaceId}/leads`}
          className="p-[8px] text-[#434655] hover:text-[#191b23] transition-colors"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
        </Link>
        <div className="flex rounded-lg border border-[#c3c6d7] overflow-hidden">
          <Link
            href={`/workspace/${workspaceId}/leads/create`}
            className={`px-[16px] py-[8px] text-[13px] leading-[18px] font-semibold tracking-[0.05em] transition-all ${!isBulk ? "bg-[#004ac6] text-white" : "bg-white text-[#434655] hover:bg-[#f3f3fe]"}`}
          >
            Single
          </Link>
          <Link
            href={`/workspace/${workspaceId}/leads/create?mode=bulk`}
            className={`px-[16px] py-[8px] text-[13px] leading-[18px] font-semibold tracking-[0.05em] transition-all ${isBulk ? "bg-[#004ac6] text-white" : "bg-white text-[#434655] hover:bg-[#f3f3fe]"}`}
          >
            Bulk Upload
          </Link>
        </div>
      </div>
      {isBulk ? (
        <CreateLeadBulkClient workspaceId={workspaceId} jobs={jobs} />
      ) : (
        <CreateLeadClient workspaceId={workspaceId} jobs={jobs} />
      )}
    </div>
  );
}
