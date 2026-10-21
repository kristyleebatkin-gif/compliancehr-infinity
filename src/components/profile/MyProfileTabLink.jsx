import React from 'react';
import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';

/* "My profile" styled at the same size as the module tabs so it can sit
   beside them in the row under the header. */
export default function MyProfileTabLink() {
  return (
    <Link
      to="/my-profile"
      className="inline-flex min-h-8 items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-background px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 ring-border transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <UserRound className="h-3.5 w-3.5 shrink-0" />
      My profile
    </Link>
  );
}