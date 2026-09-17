import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

interface CalloutProps {
  title: string;
  children: ReactNode;
}

/** A calm, highlighted note for disclaimers on the content pages. */
export function Callout({ title, children }: CalloutProps) {
  return (
    <aside className="callout" role="note">
      <Info size={20} className="callout-icon" aria-hidden="true" />
      <div>
        <strong className="callout-title">{title}</strong>
        <p className="callout-text">{children}</p>
      </div>
    </aside>
  );
}
