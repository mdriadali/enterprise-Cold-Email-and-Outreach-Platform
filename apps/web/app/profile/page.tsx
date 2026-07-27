import { requireSession } from "../src/auth/require-session";
import { getCurrentUserProfile, updateProfile } from "../src/actions/auth/profile";
import { ProfilePage } from "./profile-page-client";

export const metadata = { title: "Profile | ColdReach AI", description: "Manage your ColdReach AI profile." };

export default async function Profile() {
  await requireSession();
  const profile = await getCurrentUserProfile();

  if (profile.status === "error") {
    return <main className="bg-[#faf8ff] p-8 text-[#191b23] min-h-svh"><div className="mx-auto max-w-[1000px]"><p className="text-[#8b1e1e]">{profile.message}</p></div></main>;
  }

  return <ProfilePage name={profile.data.name} email={profile.data.email} role={profile.data.role} onUpdateName={updateProfile} />;
}
