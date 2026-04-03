import Image from "next/image";
import Link from "next/link";

type HeroProps = {
  kicker: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  cta?: { label: string; href: string };
};

export function Hero({
  kicker,
  title,
  subtitle,
  imageSrc,
  imageAlt,
  cta,
}: HeroProps) {
  return (
    <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
      {/* Background image */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Overlay — bottom-up gradient for content legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/35 to-slate-900/10"
        aria-hidden
      />
      {/* Top overlay — extra density for fixed navbar text contrast */}
      <div
        className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent"
        aria-hidden
      />

      {/* Content — bottom-anchored */}
      <div className="relative mx-auto flex h-full max-w-content flex-col justify-end px-6 pb-16 pt-32 md:px-10 md:pb-24">
        <p className="mb-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-sabbia/80">
          {kicker}
        </p>
        <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-[1.1] text-sabbia md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-sabbia/85 md:text-lg">
          {subtitle}
        </p>

        {cta && (
          <div className="mt-10">
            <Link
              href={cta.href}
              className="inline-block rounded border border-sabbia/70 px-7 py-3 font-sans text-sm font-semibold text-sabbia transition-all duration-200 hover:bg-sabbia hover:text-mare"
            >
              {cta.label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
