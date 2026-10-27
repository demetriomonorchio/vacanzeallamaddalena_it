import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminSecret, igLib, isAdmin } from "@/lib/instagram-admin";
import { formatPublishLong, scheduleFor } from "@/lib/instagram-schedule";
import { LoginForm, LogoutButton, PublishForm } from "../../forms";

export const metadata: Metadata = {
  title: "Anteprima post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CATEGORIES = new Set(["isole", "attivita", "guida", "utilities"]);

export default async function InstagramPreviewPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  if (!adminSecret()) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-sm">
        Aggiungi <code>INSTAGRAM_ADMIN_SECRET</code> in <code>.env</code> e riavvia il sito.
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

  const { category, slug } = await params;
  if (!CATEGORIES.has(category)) notFound();

  const lib = await igLib();
  const guide = lib.loadGuides().find((item) => item.category === category && item.slug === slug);
  if (!guide) notFound();

  const saved = lib.readQueue().items.find((item) => item.id === `${category}/${slug}`);
  let draftError = "";
  let draft: ReturnType<typeof lib.buildDraft> | null = null;
  try {
    draft = lib.buildDraft(guide);
  } catch (error) {
    draftError = error instanceof Error ? error.message : "Anteprima non disponibile";
  }

  const imageSrc = draft?.imageUrl.replace("https://vacanzeallamaddalena.it", "") ?? "";
  const slot = scheduleFor(category, slug);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <Link href="/admin/instagram" className="text-sm text-slate/70 underline">
          Tutte le guide
        </Link>
        <LogoutButton />
      </div>
      <h1 className="mt-6 font-serif text-4xl text-mare">{guide.title}</h1>
      {slot ? (
        <p className="mt-3 text-sm text-slate/70">In programma {formatPublishLong(slot.date)}</p>
      ) : null}
      {saved?.status === "published" && saved.permalink ? (
        <p className="mt-3 text-sm">
          Già pubblicato.{" "}
          <a className="underline" href={saved.permalink} target="_blank" rel="noreferrer">
            Vedi su Instagram
          </a>
          {saved.facebookPermalink ? (
            <>
              {" "}
              ·{" "}
              <a className="underline" href={saved.facebookPermalink} target="_blank" rel="noreferrer">
                Vedi su Facebook
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      {draftError ? <p className="mt-6 text-sm text-red-700">{draftError}</p> : null}
      {draft ? (
        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,280px)_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={guide.title} className="w-full bg-white" />
          <div className="space-y-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{draft.caption}</pre>
            {saved?.status === "published" && saved.facebookPermalink ? null : (
              <PublishForm id={draft.id} />
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
