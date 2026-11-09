import { updateScheduleDate } from "./actions";

/** Form server: una riga = una data, senza client hooks. */
export function ScheduleDateForm({ id, date }: { id: string; date: string }) {
  return (
    <form action={updateScheduleDate} className="flex shrink-0 items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        type="date"
        name="date"
        required
        defaultValue={date}
        className="rounded border border-slate/20 bg-white px-2 py-1 text-xs text-slate"
      />
      <button type="submit" className="text-xs text-mare underline">
        Salva
      </button>
    </form>
  );
}
