"use client";

import "./globals.css";

/** Last-resort error boundary (errors in the root layout). Must render its own <html>. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body className="flex min-h-dvh items-center justify-center px-4 font-sans">
        <div className="grid max-w-sm gap-4 text-center">
          <h1 className="text-xl font-semibold">Etwas ist schiefgelaufen</h1>
          <p className="text-sm text-muted-foreground">
            Bitte lade die Seite neu. Deine gespeicherten Daten sind nicht verloren.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mx-auto h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
