import React from 'react';
import { Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';

/* "My profile" styled at the same size as the module tabs so it can sit
   beside them in the row under the header, highlighted in pink. */
export default function MyProfileTabLink() {
  return (
    <Link
      to="/my-profile"
      className="inline-flex min-h-8 items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-800 shadow-sm ring-1 ring-pink-300 transition-all hover:bg-pink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <UserRound className="h-3.5 w-3.5 shrink-0" />
      My profile
    </Link>
  );
}