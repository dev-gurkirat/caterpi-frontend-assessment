import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/lib/domain/routes";

export function PassportSignInState() {
  return (
    <EmptyState
      title="Sign in to continue"
      description="Your skills passport is only available after you sign in."
      action={<ButtonLink href={ROUTES.login}>Sign in</ButtonLink>}
    />
  );
}

export function PassportErrorState({ message }: { message: string }) {
  return (
    <EmptyState
      title="Unable to load this passport"
      description={message}
    />
  );
}

export function PassportEmptyState() {
  return (
    <EmptyState
      title="Your passport is not ready yet"
      description="Please try again later."
    />
  );
}
