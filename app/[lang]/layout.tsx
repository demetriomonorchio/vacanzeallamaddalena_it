import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { isLocale, type Locale } from "@/lib/i18n";
import { siteMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
  return [{ lang: "it" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return siteMetadata(lang);
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <Navbar locale={lang as Locale} />
      <main id="main">{children}</main>
      <footer className="border-t border-mare/10 bg-sabbia py-12 text-center">
        <p className="font-sans text-xs text-slate/60">
          {lang === "it"
            ? "Un progetto editoriale sul territorio dell’arcipelago."
            : "An editorial project on the archipelago."}
        </p>
      </footer>
    </>
  );
}
