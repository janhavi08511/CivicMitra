import { api } from "./api";
import { auth } from "../auth";

export const signInWithGoogle = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    return currentUser;
  }

  throw new Error("Google sign-in is disabled in this build. Please use email and password.");
};
