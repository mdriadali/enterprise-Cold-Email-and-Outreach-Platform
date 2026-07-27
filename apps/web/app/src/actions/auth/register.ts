"use server";

import { webEnv } from "@repo/env/web-env";
import { RegistrationState } from "../../states/auth.states";
import { persistSessionCookies } from "./session";
import axios from "axios";
import { registrationSchema } from "../../components/auth/auth-schemas";

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
      return { status: "error", message: "We couldn't create your account. Please try again." };
    }

    await persistSessionCookies(response.headers["set-cookie"]);
    return { status: "success" };
  } catch (error: unknown) {
    return {
      status: "error",
      message: getServerErrorMessage(error) ?? "We couldn't reach the registration service. Please try again.",
    };
  }
}

function getServerErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const message = "message" in data ? data.message : "massage" in data ? data.massage : null;
  return typeof message === "string" && message.trim() ? message.trim() : null;
}

function isSuccessfulRegistration(payload: unknown): payload is RegisterResponse {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "sucess" in payload &&
    payload.sucess === true
  );
}
