import { updateScheduleDate } from "./actions";

/** Form server: una riga = una data. */
export function ScheduleDateForm({ id, date }: { id: string; date: string }) {
  return (
    <form action={updateScheduleDate} className="flex shrink-0 items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        type="date"
        name="date"
        required
        defaultValue={date || undefined}
        className="rounded border border-slate/20 bg-white px-2 py-1 text-xs text-slate"
      />
      <button
        type="submit"
        className="rounded bg-mare px-2 py-1 text-xs text-white hover:opacity-90"
      >
        Salva
      </button>
    </form>
  );
}
