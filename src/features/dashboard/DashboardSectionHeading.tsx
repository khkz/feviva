interface DashboardSectionHeadingProps {
  title: string;
  description?: string;
}

export function DashboardSectionHeading({ title, description }: DashboardSectionHeadingProps) {
  return (
    <header className="mb-3 px-5 lg:px-0">
      <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
      {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
    </header>
  );
}