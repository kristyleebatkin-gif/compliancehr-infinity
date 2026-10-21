import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function EmployeeAlertAction({ notification }) {
  const path = notification.action_url || (notification.linked_entity_type === 'TodoTask' ? `/tasks?task=${encodeURIComponent(notification.linked_entity_id || '')}` : null);
  if (!path || !/^\/(?![\/\\])/.test(path) || /[\r\n\\]/.test(path)) return null;
  return <Button asChild variant="outline" size="sm"><Link to={path}>Open</Link></Button>;
}