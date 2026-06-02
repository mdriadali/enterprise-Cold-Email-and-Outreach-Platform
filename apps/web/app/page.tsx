import {prismaClient} from '@repo/db'
import { env } from '@repo/env';
export default async function Home() {
  console.log("WEB DATABASE_URL =", env.DATABASE_URL);
  const envs=env.TESTENV
  const users=await prismaClient.user.findMany()
  return (
    <div>
      <h1>envs{envs}</h1>
      {JSON.stringify(users)||"hellow"}
    </div>
  );
}
