import { notFound } from "next/navigation";
import { getUserAdminDetail } from "../../../../src/actions/admin/users";
import { AdminUserDetailClient } from "./admin-user-detail-client";

export const metadata = {
  title: "User Detail — ColdReach Admin",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const result = await getUserAdminDetail(userId);

  if (result.status === "error") {
    notFound();
  }

  return <AdminUserDetailClient user={result.data} />;
}
