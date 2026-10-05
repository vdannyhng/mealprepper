import { CalendarDays, ChefHat, Flame, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";

const STEPS = [
  { icon: CalendarDays, title: "Woche planen", text: "Rezepte auf deine Makroziele abstimmen." },
  { icon: ShoppingCart, title: "Einkaufen", text: "Die Einkaufsliste entsteht automatisch." },
  { icon: ChefHat, title: "Meal Prep", text: "Geführte Session mit Checkliste und Foto." },
  { icon: Flame, title: "Dranbleiben", text: "Streaks zeigen deinen Fortschritt." },
];

/** Public landing page. Signed-in users are redirected to /dashboard by the proxy. */
export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo href="/" />
        <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
          Anmelden
        </Link>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-10 py-12">
        <div className="grid max-w-2xl gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Was musst du diese Woche vorbereiten, um deine Ziele zu erreichen?
          </h1>
          <p className="text-lg text-muted-foreground">
            MealPrepper plant deine Woche anhand deiner Kalorien- und Makroziele und führt dich
            durch Einkauf und Meal Prep.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Kostenlos starten
            </Link>
            <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Ich habe ein Konto
            </Link>
          </div>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="grid gap-2 rounded-xl border bg-card p-4">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="size-4 text-primary" aria-hidden />
                {index + 1}. {title}
              </span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
