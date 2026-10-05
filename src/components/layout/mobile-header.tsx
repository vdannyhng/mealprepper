import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
      <Logo />
      <ThemeToggle />
    </header>
  );
}
