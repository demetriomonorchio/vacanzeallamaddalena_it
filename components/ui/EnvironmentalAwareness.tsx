"use client";

type EnvironmentalAwarenessProps = {
  className?: string;
};

type DecalogoIcon = "ashtray" | "leaf" | "wave";

const decalogo: Array<{ icon: DecalogoIcon; text: string }> = [
  {
    icon: "ashtray",
    text: "Porta con te un posacenere tascabile: Sono economici, leggeri e chiudibili ermeticamente.",
  },
  {
    icon: "leaf",
    text: "Usa le stazioni di raccolta: Se presenti agli ingressi delle spiagge, utilizza i contenitori appositi.",
  },
  {
    icon: "wave",
    text: "Mai sotto la sabbia: Nascondere un mozzicone lo rende solo piu difficile da raccogliere.",
  },
  {
    icon: "leaf",
    text: "Differenzia i rifiuti: I mozziconi vanno nel secco residuo.",
  },
  {
    icon: "wave",
    text: "Diventa un esempio: Se vedi un mozzicone abbandonato, raccoglilo.",
  },
];

function MinimalIcon({ kind }: { kind: DecalogoIcon }) {
  if (kind === "ashtray") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path d="M5 14h14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 10h6M11 7h2M13 4h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "leaf") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
        <path
          d="M19 5c-6 0-11 5-11 11 0 1.7.3 2.3 1 3 4.6 0 10-3.8 10-10V5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 18c2-2 4.8-4 8-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M3 13c1.8 1.4 3.6 1.4 5.4 0s3.6-1.4 5.4 0 3.6 1.4 5.4 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function EnvironmentalAwareness({ className }: EnvironmentalAwarenessProps) {
  return (
    <section className={`bg-[#fdfcf0] px-6 py-20 md:px-10 md:py-28 ${className ?? ""}`}>
      <div className="mx-auto max-w-4xl text-[#1f2f45]">
        <header className="mb-12">
          <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
            Il Paradiso non merita un filtro: proteggiamo La Maddalena dai mozziconi
          </h1>
          <p className="mb-8 mt-8 font-sans text-lg leading-relaxed text-[#2f3f55]">
            L&apos;Arcipelago de La Maddalena e un santuario di biodiversita, un mosaico di acque
            turchesi e granito modellato dal vento. Eppure, tra i granelli di sabbia bianca di Cala
            Coticcio o sotto il sole di Spalmatore, si nasconde un nemico silenzioso, piccolo solo
            all&apos;apparenza: il mozzicone di sigaretta.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="font-serif text-3xl font-semibold">I numeri di un&apos;invasione invisibile</h2>
          <p className="mb-8 mt-8 font-sans text-lg leading-relaxed text-[#2f3f55]">
            In Italia si stima vengano fumate circa 190 milioni di sigarette ogni giorno. Sebbene i
            dati dell&apos;Istituto Superiore di Sanita mostrino una lieve flessione nel numero di
            fumatori, la quantita di rifiuti prodotti resta vertiginosa.
          </p>

          <div className="mb-8 rounded-2xl border border-[#d6dfeb] bg-white/70 p-8">
            <p className="font-sans text-base uppercase tracking-[0.14em] text-[#3b4f69]">
              Dato chiave
            </p>
            <p className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
              50 miliardi di mozziconi = 8 km² = 5 volte l&apos;isola di Budelli
            </p>
            <p className="mt-4 font-sans text-lg leading-relaxed text-[#2f3f55]">
              Facciamo un calcolo rapido per capire l&apos;impatto: 50 miliardi di mozziconi (il
              consumo stimato annuo in Italia) occupano una superficie di circa 8 chilometri quadrati.
              E come se decidessimo di ricoprire l&apos;intera isola di Budelli con un tappeto
              ininterrotto di filtri usati per ben cinque volte.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-3xl font-semibold">
            Perche un mozzicone in spiaggia e un disastro?
          </h2>
          <p className="mb-8 mt-8 font-sans text-lg leading-relaxed text-[#2f3f55]">
            Molti pensano che il filtro sia di carta o cotone. In realta, e composto da acetato di
            cellulosa, una materia plastica che puo impiegare fino a 10 anni per decomporsi.
          </p>
          <p className="mb-8 font-sans text-lg leading-relaxed text-[#2f3f55]">
            Quando abbandoni un mozzicone sulla sabbia:
          </p>
          <ul className="space-y-5 font-sans text-lg leading-relaxed text-[#2f3f55]">
            <li>
              <strong className="text-[#1f2f45]">Inquina l&apos;acqua:</strong> Un solo mozzicone puo
              contaminare fino a 1.000 litri d&apos;acqua.
            </li>
            <li>
              <strong className="text-[#1f2f45]">Avvelena la fauna:</strong> I pesci e gli uccelli
              marini scambiano i filtri per cibo. Le sostanze chimiche (arsenico, piombo, nicotina)
              entrano nella catena alimentare, arrivando potenzialmente fino a noi.
            </li>
            <li>
              <strong className="text-[#1f2f45]">Danneggia l&apos;estetica:</strong> La Maddalena e
              famosa per la purezza dei suoi scenari. Un filtro spento nella sabbia rompe
              l&apos;incantesimo per te e per chi verra dopo di te.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-3xl font-semibold">Il decalogo del turista consapevole</h2>
          <p className="mb-8 mt-8 font-sans text-lg leading-relaxed text-[#2f3f55]">
            Godersi una sigaretta guardando il mare non e vietato, ma farlo con rispetto e un dovere.
            Ecco come comportarsi:
          </p>
          <ol className="space-y-5">
            {decalogo.map((item, idx) => (
              <li
                key={`${item.text}-${idx}`}
                className="flex items-start gap-3 rounded-xl border border-[#dbe3ee] bg-white/60 p-4"
              >
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf2f8] text-[#355071]">
                  <MinimalIcon kind={item.icon} />
                </span>
                <p className="font-sans text-base leading-relaxed text-[#2f3f55]">
                  <span className="mr-2 font-semibold text-[#1f2f45]">{idx + 1}.</span>
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <blockquote className="mx-auto mb-12 max-w-3xl border-y border-[#d6dfeb] py-10 text-center">
          <p className="font-serif text-2xl italic leading-relaxed text-[#243a56] md:text-3xl">
            &quot;La natura ci regala la bellezza, noi dobbiamo regalarle il rispetto.&quot;
          </p>
        </blockquote>

        <section>
          <p className="mb-8 font-sans text-lg leading-relaxed text-[#2f3f55]">
            Visitare La Maddalena e un privilegio. Lasciare la spiaggia pulita e il modo piu sincero
            per dire &quot;grazie&quot; a questa terra meravigliosa.
          </p>
          <p className="font-serif text-2xl leading-snug text-[#1f2f45]">
            Non bruciare le tue vacanze, proteggi l&apos;Arcipelago.
          </p>
        </section>
      </div>
    </section>
  );
}
