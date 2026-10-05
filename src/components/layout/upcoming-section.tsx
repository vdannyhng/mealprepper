import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "./page-header";

interface UpcomingSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: ReactNode;
}

/** Page frame for areas whose feature is scheduled for a later implementation step. */
export function UpcomingSection({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}: UpcomingSectionProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
    </>
  );
}
