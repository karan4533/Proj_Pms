import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  // Redirect to dashboard (project-centric, no workspace needed)
  redirect("/dashboard");
}
