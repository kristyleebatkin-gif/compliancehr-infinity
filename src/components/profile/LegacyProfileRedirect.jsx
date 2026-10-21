import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

export default function LegacyProfileRedirect({ kind, progress = false }) {
  const { id } = useParams();
  const { search, hash } = useLocation();
  const params = new URLSearchParams(search);
  if (progress) params.set('staffTab', 'progress');
  const base = kind === 'participant' ? '/our-participants' : '/our-employees';
  return <Navigate replace to={{ pathname: id ? `${base}/${encodeURIComponent(id)}` : base, search: params.toString() ? `?${params}` : '', hash }} />;
}