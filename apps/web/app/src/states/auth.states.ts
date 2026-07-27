export type RegistrationState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type AuthenticationState = RegistrationState;

 const initialRegistrationState: RegistrationState = { status: "idle" };

export {initialRegistrationState}
