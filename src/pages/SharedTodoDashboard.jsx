import React from 'react';

import TodoBoard from '@/components/communications/TodoBoard';

export default function SharedTodoDashboard() {
  return <TodoBoard compact presentation="review" />;
}