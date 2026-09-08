import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "../../src/actions/auth/profile";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentUserProfile();
  const isAdmin = profile.status === "success" && profile.data.role === "ADMIN";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
