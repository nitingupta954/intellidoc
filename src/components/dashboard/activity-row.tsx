import Link from "next/link";

interface ActivityRowProps {
  icon: React.ReactNode;
  title: string;
  meta: string;
  href?: string;
  isLast?: boolean;
}

export function ActivityRow({
  icon,
  title,
  meta,
  href,
  isLast = false,
}: ActivityRowProps) {
  const content = (
    <>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>
      </div>
    </>
  );

  const className = `flex min-w-0 items-center gap-3 py-3 ${
    isLast ? "" : "border-b border-border"
  }`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} -mx-2 rounded-lg px-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
