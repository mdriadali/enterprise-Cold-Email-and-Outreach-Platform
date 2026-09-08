import { notFound } from "next/navigation";
import { getUserAdminDetail } from "../../../../../src/actions/admin/users";
import { UpdateUserRoleClient } from "./update-user-role-client";

export const metadata = {
  title: "Update User Role — ColdReach Admin",
};

export default async function AdminUserRolePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const result = await getUserAdminDetail(userId);

  if (result.status === "error") {
    notFound();
  }

  return <UpdateUserRoleClient user={result.data} />;
}
