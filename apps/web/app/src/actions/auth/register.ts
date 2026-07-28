"use server";

import { webEnv } from "@repo/env/web-env";
import { RegistrationState } from "../../states/auth.states";
import { persistSessionCookies } from "./session";
import axios from "axios";
import { registrationSchema } from "../../components/auth/auth-schemas";

import { extractMessage } from "./shared";

type RegisterResponse = {
  sucess: true;
};

export async function registerEnterpriseAccount(formData: FormData): Promise<RegistrationState> {
  const validation = registrationSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    terms: formData.get("terms") === "on",
  });

  if (!validation.success) {
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors: validation.error.flatten().fieldErrors };
  }

  const { name, email, password } = validation.data;

  try {
    const response = await axios.post(
      new URL("auth/register", webEnv.HTTP_SERVER_URL).toString(),
      {
        name,
        email,
        password,
      },
    );

    const payload: unknown = response.data;

    if (!isSuccessfulRegistration(payload)) {
      return { status: "error", message: extractMessage(payload) ?? "Registration failed." };
    }

    await persistSessionCookies(response.headers["set-cookie"]);
    return { status: "success" };
  } catch (error: unknown) {
    return {
      status: "error",
      message: extractMessage(axios.isAxiosError(error) ? error.response?.data : error) ?? "Registration failed.",
    };
  }
}

function isSuccessfulRegistration(payload: unknown): payload is RegisterResponse {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "sucess" in payload &&
    payload.sucess === true
  );
}
