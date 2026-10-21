import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FolderOpen } from 'lucide-react';

// Documents quick-access for the current module's header.
// Links every module into the Document Vault, focused on that module's own
// document section (employee, participant or business library).
export default function ModuleDocsButton() {
  const { pathname } = useLocation();
  const seg = `/${pathname.split('/')[1] || ''}`;

  if (seg === '/documents') return null;

  let focus = '';
  if (seg === '/our-employees' || seg === '/staff') focus = 'employee';
  else if (seg === '/our-participants' || seg === '/participants') focus = 'participant';
  else if (seg === '/company-safe') focus = 'business';
  else if (pathname.startsWith('/intake/participant')) focus = 'participant';
  else if (pathname.startsWith('/intake/employee')) focus = 'employee';

  const href = focus ? `/documents?focus=${focus}` : '/documents';
  const title = focus
    ? 'Open this module\'s documents in the Document Vault'
    : 'Open the Document Vault';

  return (
    <Button asChild variant="outline" size="sm" className="h-7 shrink-0 gap-1 bg-white/70 px-2 text-[11px] [&_svg]:mr-0 [&_svg]:size-3.5">
      <Link to={href} title={title}>
        <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
        Docs
      </Link>
    </Button>
  );
}