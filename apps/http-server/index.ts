import { prismaClient } from "@repo/db";
import { env } from "@repo/env";

console.log("http DATABASE_URL =", env.DATABASE_URL);
console.log("http TESTENV =", env.TESTENV);

async function test() {
  try {
    const users = await prismaClient.user.findMany();
    console.log("Users fetched successfully:", users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
}

test();