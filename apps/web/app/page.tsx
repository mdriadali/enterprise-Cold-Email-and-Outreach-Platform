export const dynamic = "force-dynamic";
import {prismaClient} from '@repo/db'
import { env } from '@repo/env';
export default async function Home() {
  console.log("WEB DATABASE_URL =", env.DATABASE_URL);
  const users=await prismaClient.user.findMany()
  return (
    <div>
      {JSON.stringify(users)||"hellow"}
    </div>
  );
}
