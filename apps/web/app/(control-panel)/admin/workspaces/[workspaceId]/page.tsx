import { notFound } from "next/navigation";
import { getWorkspaceAdminDetail } from "../../../../src/actions/admin/workspaces";
import { AdminWorkspaceDetailClient } from "./admin-workspace-detail-client";

export const metadata = {
  title: "Workspace Detail — ColdReach Admin",
};

export default async function AdminWorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const result = await getWorkspaceAdminDetail(workspaceId);

  if (result.status === "error") {
    notFound();
  }

  return <AdminWorkspaceDetailClient workspace={result.data} />;
}