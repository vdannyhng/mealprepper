import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton variant="outline" className="w-full sm:w-auto">
        <LogOut aria-hidden /> Abmelden
      </SubmitButton>
    </form>
  );
}
