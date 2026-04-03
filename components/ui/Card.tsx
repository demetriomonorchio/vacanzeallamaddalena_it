import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type CardLinkProps = {
  href: string;
  title: string;
  excerpt: string;
  external?: boolean;
  icon?: ReactNode;
  cta: string;
  image?: string;
};

export function Card({
  href,
  title,
  excerpt,
  external,
  icon,
  cta,
  image,
}: CardLinkProps) {
  const className =
    "group flex h-full flex-col border border-mare/15 bg-sabbia shadow-sm transition-shadow duration-300 hover:shadow-md overflow-hidden";

  const inner = (
    <>
      {image ? (
        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-t-xl">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-8">
        {icon ? (
          <div className="mb-4 text-mare opacity-80 transition-opacity group-hover:opacity-100">
            {icon}
          </div>
        ) : null}
        <h3 className="font-serif text-2xl font-semibold text-mare transition-colors group-hover:text-mare/90">
          {title}
        </h3>
        <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-slate/85">
          {excerpt}
        </p>
        <span className="mt-6 inline-flex items-center font-sans text-xs font-semibold uppercase tracking-wider text-mare underline-offset-4 group-hover:underline">
          {cta}
        </span>
      </div>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
