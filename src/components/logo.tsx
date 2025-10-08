import { cn } from '@/lib/utils';

export function Logo({
  withText = true,
  className,
}: {
  withText?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: 'hsl(var(--foreground))', stopOpacity: 1 }}
            />
          </linearGradient>
        </defs>
        <path
          d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L22 7"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12V22"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L2 7"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 9.5L17 14.5"
          stroke="url(#logo-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {withText && (
        <h1 className="text-base font-semibold tracking-tight text-white font-headline">
          AfriConnect Exchange
        </h1>
      )}
    </div>
  );
}
