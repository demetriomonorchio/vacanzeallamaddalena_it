import type { Metadata } from "next";
import Link from "next/link";
import { adminSecret, igLib, isAdmin, type IgDraft } from "@/lib/instagram-admin";
import {
  formatPublishedAt,
  formatPublishWhen,
  instagramSchedule,
  romeToday,
} from "@/lib/instagram-schedule";
import { LoginForm, LogoutButton, ScheduleDateForm } from "./forms";

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
  await lib.ensureScheduleSeeded(instagramSchedule);
  const guides = lib.loadGuides();
  const queue = await lib.readQueue();
  const byId = new Map(queue.items.map((item: IgDraft) => [item.id, item]));
  const calendar = queue.items
    .filter((item: IgDraft) => item.scheduledFor)
    .sort((a: IgDraft, b: IgDraft) => (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? ""));
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
        Orario di riferimento 19:00. Apri la bozza, controlla, poi pubblica. Puoi spostare le
        date dei post non ancora pubblicati.
      </p>
      <section className="mt-8">
        <h2 className="font-serif text-2xl text-mare">Calendario</h2>
        <ul className="mt-3 divide-y divide-slate/10 border-y border-slate/10">
          {calendar.map((item: IgDraft) => {
            const title = titleById.get(item.id) ?? item.slug;
            const isPublished = item.status === "published";
            const date = item.scheduledFor ?? "";
            const when = isPublished
              ? "pubblicato"
              : date < today
                ? "in ritardo"
                : date === today
                  ? "oggi"
                  : "";
            return (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <Link href={`/admin/instagram/${item.id}`} className="min-w-0 hover:underline">
                  {title}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <ScheduleDateForm key={`${item.id}-${date}`} id={item.id} date={date} />
                  <span className="text-xs text-slate/60">
                    {isPublished && item.publishedAt
                      ? `${formatPublishedAt(item.publishedAt)} · pubblicato`
                      : when
                        ? `${formatPublishWhen(date)} · ${when}`
                        : formatPublishWhen(date)}
                  </span>
                </div>
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
                  const row = byId.get(id);
                  const isPublished = row?.status === "published";
                  return (
                    <li key={id} className="flex items-center justify-between gap-4 py-3">
                      <Link
                        href={`/admin/instagram/${guide.category}/${guide.slug}`}
                        className="hover:underline"
                      >
                        {guide.title}
                      </Link>
                      <span className="shrink-0 text-xs text-slate/60">
                        {isPublished && row?.publishedAt
                          ? `${formatPublishedAt(row.publishedAt)} · pubblicato`
                          : isPublished
                            ? "pubblicato"
                            : row?.scheduledFor
                              ? formatPublishWhen(row.scheduledFor)
                              : "senza data"}
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
