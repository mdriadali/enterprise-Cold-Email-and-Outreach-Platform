export const dynamic = "force-dynamic";
import {prismaClient} from '@repo/db'
import { sharedEnv } from '@repo/env/shared-env';

export default async function Home() {
  console.log("WEB DATABASE_URL =", sharedEnv.DATABASE_URL);
  const users=await prismaClient.user.findMany()
  return (
    <div>
      {JSON.stringify(users)||"hellow"}
    </div>
  );
}
