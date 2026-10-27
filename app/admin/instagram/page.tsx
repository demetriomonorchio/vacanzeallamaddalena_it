import type { Metadata } from "next";
import Link from "next/link";
import { adminSecret, igLib, isAdmin, type IgDraft } from "@/lib/instagram-admin";
import {
  formatPublishWhen,
  instagramSchedule,
  romeToday,
  scheduleFor,
} from "@/lib/instagram-schedule";
import { LoginForm, LogoutButton } from "./forms";

export const metadata: Metadata = {
  title: "Post Instagram",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  isole: "Isole",
  attivita: "Attività",
  guida: "Guida",
  utilities: "Utilità",
};

export default async function InstagramAdminPage() {
  if (!adminSecret()) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-serif text-3xl text-mare">Post Instagram</h1>
        <p className="mt-4 text-sm">
          Aggiungi <code>INSTAGRAM_ADMIN_SECRET</code> in <code>.env</code> e riavvia il sito.
        </p>
      </main>
    );
  }
  if (!(await isAdmin())) {
    return (
      <main className="px-6">
        <LoginForm />
      </main>
    );
  }

  const lib = await igLib();
  const guides = lib.loadGuides();
  const published = new Map(
    lib
      .readQueue()
      .items.filter((item: IgDraft) => item.status === "published")
      .map((item: IgDraft) => [item.id, item.permalink ?? ""])
  );
  const groups = ["isole", "attivita", "guida", "utilities"];
  const today = romeToday();
  const titleById = new Map(guides.map((guide) => [`${guide.category}/${guide.slug}`, guide.title]));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-4xl text-mare">Post Instagram</h1>
        <LogoutButton />
      </div>
      <p className="mt-2 text-sm text-slate/70">
        Martedì e sabato alle 19:00. Apri la bozza del giorno, controlla, poi pubblica.
      </p>
      <section className="mt-8">
        <h2 className="font-serif text-2xl text-mare">Calendario</h2>
        <ul className="mt-3 divide-y divide-slate/10 border-y border-slate/10">
          {instagramSchedule.map((slot) => {
            const id = `${slot.category}/${slot.slug}`;
            const title = titleById.get(id) ?? slot.slug;
            const isPublished = published.has(id);
            const when =
              isPublished ? "pubblicato" : slot.date < today ? "in ritardo" : slot.date === today ? "oggi" : "";
            return (
              <li key={id} className="flex items-center justify-between gap-4 py-3">
                <Link href={`/admin/instagram/${id}`} className="hover:underline">
                  {title}
                </Link>
                <span className="shrink-0 text-xs text-slate/60">
                  {formatPublishWhen(slot.date)}
                  {when ? ` · ${when}` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="mt-10 space-y-8">
        {groups.map((category) => (
          <section key={category}>
            <h2 className="font-serif text-2xl text-mare">{LABELS[category]}</h2>
            <ul className="mt-3 divide-y divide-slate/10 border-y border-slate/10">
              {guides
                .filter((guide) => guide.category === category)
                .map((guide) => {
                  const id = `${guide.category}/${guide.slug}`;
                  const link = published.get(id);
                  const slot = scheduleFor(guide.category, guide.slug);
                  return (
                    <li key={id} className="flex items-center justify-between gap-4 py-3">
                      <Link href={`/admin/instagram/${guide.category}/${guide.slug}`} className="hover:underline">
                        {guide.title}
                      </Link>
                      <span className="shrink-0 text-xs text-slate/60">
                        {link ? "pubblicato" : slot ? formatPublishWhen(slot.date) : "senza data"}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
