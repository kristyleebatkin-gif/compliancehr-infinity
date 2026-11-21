import React from 'react';
import { Link } from 'react-router-dom';

export default function WorkspaceShortcuts({ allowed, favourites, recent, className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm ${className}`}>
      <span className="font-bold">Favourites</span>
      {favourites.length ? favourites.map((key) => allowed.find((item) => item.key === key)).filter(Boolean).map((item) => <Link key={item.key} to={item.path} className="rounded-lg bg-[#0072FF]/10 px-3 py-3 font-semibold">{item.label}</Link>) : <span>Use Find a module to save shortcuts.</span>}
      {!!recent.length && <><span className="ml-2 font-bold">Recent</span>{recent.map((key) => allowed.find((item) => item.key === key)).filter(Boolean).map((item) => <Link key={item.key} to={item.path} className="rounded-lg px-3 py-3 text-[#5A00D6]">{item.label}</Link>)}</>}
    </div>
  );
}