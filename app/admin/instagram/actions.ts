"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminCookie, adminSecret, igLib, isAdmin } from "@/lib/instagram-admin";

export type FormState = { error?: string; permalink?: string; facebookPermalink?: string } | null;

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  const secret = adminSecret();
  if (!secret) return { error: "Manca INSTAGRAM_ADMIN_SECRET in .env" };
  const password = String(formData.get("password") ?? "");
  if (password !== secret) return { error: "Password sbagliata" };
  const cookie = adminCookie(secret);
  (await cookies()).set(cookie.name, cookie.value, cookie.options);
  redirect("/admin/instagram");
}

export async function logout() {
  (await cookies()).delete("ig_admin");
  redirect("/admin/instagram");
}

export async function publishPost(_state: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { error: "Accesso scaduto. Entra di nuovo." };
  const id = String(formData.get("id") ?? "");
  const [category, slug] = id.split("/");
  if (!category || !slug) return { error: "Guida non valida" };

  try {
    const lib = await igLib();
    const guide = lib.loadGuides().find((item) => item.category === category && item.slug === slug);
    if (!guide) return { error: "Guida non trovata" };
    const draft = lib.buildDraft(guide);
    const published = await lib.publishDraft(draft);
    revalidatePath("/admin/instagram");
    revalidatePath(`/admin/instagram/${category}/${slug}`);
    return published;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pubblicazione non riuscita";
    return { error: message };
  }
}

export async function updateScheduleDate(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  if (!(await isAdmin())) return { error: "Accesso scaduto. Entra di nuovo." };
  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  const [category, slug] = id.split("/");
  if (!category || !slug) return { error: "Guida non valida" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Data non valida" };

  try {
    const lib = await igLib();
    const queue = await lib.readQueue();
    const existing = queue.items.find((item) => item.id === id);
    if (existing?.status === "published") {
      return { error: "Post già pubblicato: la data pianificata non si modifica" };
    }
    await lib.updateScheduledFor(id, date);
    revalidatePath("/admin/instagram");
    revalidatePath(`/admin/instagram/${category}/${slug}`);
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Salvataggio non riuscito";
    return { error: message };
  }
}
