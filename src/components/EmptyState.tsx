export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface fade-in rounded-2xl px-6 py-12 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-2xl text-brand">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
