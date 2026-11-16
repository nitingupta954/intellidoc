import Image from "next/image";

interface ProductShotProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
  className?: string;
}

export function ProductShot({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
  className,
}: ProductShotProps) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_70px_-30px_rgb(15_23_42_/_0.35)]">
        <div className="flex h-9 items-center gap-2 border-b border-border bg-muted/60 px-4">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
          </span>
          <span className="mx-auto rounded-md bg-card px-3 py-0.5 text-[10px] font-medium text-muted-foreground">
            IntelliDoc workspace
          </span>
        </div>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1120px"
          className="h-auto w-full"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
