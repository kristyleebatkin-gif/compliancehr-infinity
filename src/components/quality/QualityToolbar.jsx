import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';

export default function QualityToolbar({ tabs, activeTab, onAdd, onExport }) {
  return <div className="flex flex-wrap items-center gap-1">
    <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
      {tabs.map((tab, index) => <React.Fragment key={tab.value}>
        <TabsTrigger value={tab.value} className="border border-primary/30 bg-primary/15 text-foreground data-[state=active]:border-primary data-[state=active]:bg-primary/35">{tab.label}</TabsTrigger>
        {index === 0 && <Button size="sm" variant="outline" className="border-primary/50 bg-primary/25 text-foreground hover:bg-primary/35" onClick={() => onAdd(tabs.find((t) => t.value === activeTab))}><Plus className="h-4 w-4" />Add {tabs.find((t) => t.value === activeTab).label.toLowerCase().replace(/s$/, '')}</Button>}
      </React.Fragment>)}
    </TabsList>
    <Button variant="outline" size="sm" className="border-safe/50 bg-safe/25 text-foreground hover:bg-safe/35" onClick={onExport}><Download className="h-4 w-4" />Export</Button>
  </div>;
}