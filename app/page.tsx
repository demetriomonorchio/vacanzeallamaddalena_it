import { redirect } from "next/navigation";

/**
 * Root entry point — immediately redirects to the default locale.
 * This runs as a Server Component (no Edge Runtime, no middleware needed).
 */
export default function RootPage() {
  redirect("/it");
}
