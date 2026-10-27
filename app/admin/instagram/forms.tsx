"use client";

import { useActionState } from "react";
import { login, logout, publishPost, type FormState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null as FormState);
  return (
    <form action={action} className="mx-auto mt-16 max-w-sm space-y-4">
      <h1 className="font-serif text-3xl text-mare">Post Instagram</h1>
      <p className="text-sm text-slate/80">Pagina riservata. Il token non esce dal server.</p>
      <label className="block text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1 w-full rounded-lg border border-slate/20 bg-white px-3 py-2"
        />
      </label>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-mare px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Accesso…" : "Entra"}
      </button>
    </form>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="text-sm text-slate/70 underline">
        Esci
      </button>
    </form>
  );
}

export function PublishForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(publishPost, null as FormState);
  if (state?.permalink) {
    return (
      <p className="text-sm">
        Pubblicato.{" "}
        <a className="underline" href={state.permalink} target="_blank" rel="noreferrer">
          Aprilo su Instagram
        </a>
        {state.facebookPermalink ? (
          <>
            {" "}
            ·{" "}
            <a className="underline" href={state.facebookPermalink} target="_blank" rel="noreferrer">
              Aprilo su Facebook
            </a>
          </>
        ) : null}
      </p>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-slate/80">
        Il post esce sul profilo demetrio_monorchio e sulla Pagina Vacanze alla maddalena.
      </p>
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-mare px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Pubblicazione…" : "Pubblica"}
      </button>
    </form>
  );
}
