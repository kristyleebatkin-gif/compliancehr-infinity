import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, Trash2, Send, Check, PackageCheck, Truck } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';

const today = () => new Date().toISOString().slice(0, 10);
const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { maximumFractionDigits: 2 })}`;
const NEXT_STATUS = { Draft: 'Submitted', Submitted: 'Approved', Approved: 'Received' };

export default function ProcurementHub() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPoForm, setShowPoForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [o, s] = await Promise.all([
      base44.entities.PurchaseOrder.filter({}, { sort: '-created_date', limit: 100 }),
      base44.entities.Supplier.filter({}, { sort: '-created_date', limit: 100 }),
    ]);
    setOrders(o.items || []);
    setSuppliers(s.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const savePo = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setSaving(true);
    await base44.entities.PurchaseOrder.create({
      po_number: f.get('po_number'),
      supplier_name: f.get('supplier_name'),
      items: f.get('items'),
      total: Number(f.get('total') || 0),
      order_date: f.get('order_date') || today(),
      required_by_date: f.get('required_by_date'),
      status: 'Draft',
    });
    setSaving(false);
    setShowPoForm(false);
    load();
  };

  const saveSupplier = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setSaving(true);
    await base44.entities.Supplier.create({
      name: f.get('name'),
      contact_name: f.get('contact_name'),
      email: f.get('email'),
      phone: f.get('phone'),
      abn: f.get('abn'),
      category: f.get('category'),
      website: f.get('website'),
      status: 'Active',
    });
    setSaving(false);
    setShowSupplierForm(false);
    load();
  };

  const advance = async (po) => {
    const next = NEXT_STATUS[po.status];
    const patch = { status: next };
    if (next === 'Approved') patch.approved_by = 'You';
    if (next === 'Received') patch.received_date = today();
    await base44.entities.PurchaseOrder.update(po.id, patch);
    load();
  };

  const statusTone = (s) => (s === 'Received' ? 'bg-safe/10 text-safe' : s === 'Approved' ? 'bg-brand/10 text-brand' : s === 'Cancelled' ? 'bg-muted text-muted-foreground' : s === 'Submitted' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground');

  const totalSpend = orders.filter((o) => o.status === 'Received').reduce((t, o) => t + Number(o.total || 0), 0);
  const committed = orders.filter((o) => ['Submitted', 'Approved'].includes(o.status)).reduce((t, o) => t + Number(o.total || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement"
        subtitle="Suppliers, purchase orders and spend tracking - from order to receipt, with full audit traceability."
        icon={ShoppingCart}
        accent={['#ca8a04', '#ea580c']}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Spend received', value: money(totalSpend), icon: PackageCheck },
          { label: 'Committed (submitted + approved)', value: money(committed), icon: Truck },
          { label: 'Open orders', value: orders.filter((o) => !['Received', 'Cancelled'].includes(o.status)).length },
          { label: 'Active suppliers', value: suppliers.filter((s) => s.status === 'Active').length },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
              {s.icon && <s.icon className="h-4 w-4 text-brand" />}
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight">{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="orders">Purchase orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowPoForm(!showPoForm)}><Plus className="mr-2 h-4 w-4" />New purchase order</Button>
            <Button size="sm" variant="outline" onClick={() => downloadCsv('purchase-orders.csv', [
              { label: 'PO number', key: 'po_number' }, { label: 'Supplier', key: 'supplier_name' }, { label: 'Items', key: 'items' },
              { label: 'Total', key: 'total' }, { label: 'Order date', key: 'order_date' }, { label: 'Required by', key: 'required_by_date' },
              { label: 'Status', key: 'status' }, { label: 'Received', key: 'received_date' },
            ], orders)}>Export CSV</Button>
          </div>
          {showPoForm && (
            <Card><CardContent className="p-4">
              <form className="grid gap-3 md:grid-cols-2" onSubmit={savePo}>
                <div className="grid gap-1.5"><Label>PO number *</Label><Input name="po_number" required placeholder="PO-2026-001" /></div>
                <div className="grid gap-1.5"><Label>Supplier *</Label>
                  <select name="supplier_name" required className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="">Select supplier...</option>
                    {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid gap-1.5 md:col-span-2"><Label>Items ordered</Label><Input name="items" /></div>
                <div className="grid gap-1.5"><Label>Total ($)</Label><Input name="total" type="number" min="0" step="0.01" /></div>
                <div className="grid gap-1.5"><Label>Order date</Label><Input name="order_date" type="date" defaultValue={today()} /></div>
                <div className="grid gap-1.5"><Label>Required by</Label><Input name="required_by_date" type="date" /></div>
                <div className="flex gap-2 md:col-span-2">
                  <Button size="sm" type="submit" disabled={saving}>Create order</Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => setShowPoForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent></Card>
          )}
          {loading ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading...</CardContent></Card> : orders.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No purchase orders yet.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((o) => (
                <Card key={o.id}><CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{o.po_number}</p>
                      <p className="text-xs text-muted-foreground">{o.supplier_name}</p>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusTone(o.status)}`}>{o.status}</span>
                  </div>
                  {o.items && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{o.items}</p>}
                  <p className="mt-2 text-lg font-bold">{money(o.total)}</p>
                  <p className="text-xs text-muted-foreground">Ordered {o.order_date ? String(o.order_date).slice(0, 10) : '-'}{o.required_by_date ? ` - required by ${o.required_by_date.slice(0, 10)}` : ''}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {NEXT_STATUS[o.status] && (
                      <Button size="sm" variant="outline" onClick={() => advance(o)}>
                        {o.status === 'Draft' && <><Send className="mr-1 h-3.5 w-3.5" />Submit</>}
                        {o.status === 'Submitted' && <><Check className="mr-1 h-3.5 w-3.5" />Approve</>}
                        {o.status === 'Approved' && <><PackageCheck className="mr-1 h-3.5 w-3.5" />Mark received</>}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-danger" onClick={async () => { await base44.entities.PurchaseOrder.delete(o.id); load(); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowSupplierForm(!showSupplierForm)}><Plus className="mr-2 h-4 w-4" />Add supplier</Button>
            <Button size="sm" variant="outline" onClick={() => downloadCsv('suppliers.csv', [
              { label: 'Name', key: 'name' }, { label: 'Contact', key: 'contact_name' }, { label: 'Email', key: 'email' },
              { label: 'Phone', key: 'phone' }, { label: 'ABN', key: 'abn' }, { label: 'Category', key: 'category' }, { label: 'Status', key: 'status' },
            ], suppliers)}>Export CSV</Button>
          </div>
          {showSupplierForm && (
            <Card><CardContent className="p-4">
              <form className="grid gap-3 md:grid-cols-2" onSubmit={saveSupplier}>
                <div className="grid gap-1.5"><Label>Supplier name *</Label><Input name="name" required /></div>
                <div className="grid gap-1.5"><Label>Contact person</Label><Input name="contact_name" /></div>
                <div className="grid gap-1.5"><Label>Email</Label><Input name="email" type="email" /></div>
                <div className="grid gap-1.5"><Label>Phone</Label><Input name="phone" /></div>
                <div className="grid gap-1.5"><Label>ABN</Label><Input name="abn" /></div>
                <div className="grid gap-1.5"><Label>Category</Label>
                  <select name="category" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                    {['Equipment', 'Consumables', 'Training', 'IT & Software', 'Vehicles', 'Cleaning', 'Professional Services', 'Other'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid gap-1.5 md:col-span-2"><Label>Website</Label><Input name="website" /></div>
                <div className="flex gap-2 md:col-span-2">
                  <Button size="sm" type="submit" disabled={saving}>Save supplier</Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => setShowSupplierForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent></Card>
          )}
          {loading ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading...</CardContent></Card> : suppliers.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No suppliers yet. Add your first supplier, then raise purchase orders against it.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {suppliers.map((s) => {
                const spend = orders.filter((o) => o.supplier_name === s.name && o.status === 'Received').reduce((t, o) => t + Number(o.total || 0), 0);
                return (
                  <Card key={s.id}><CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div><p className="font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.category}</p></div>
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${s.status === 'Active' ? 'bg-safe/10 text-safe' : 'bg-muted text-muted-foreground'}`}>{s.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{s.contact_name || ''}{s.email ? ` - ${s.email}` : ''}{s.phone ? ` - ${s.phone}` : ''}</p>
                    <p className="mt-1 text-xs font-semibold">Historic spend: {money(spend)}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={async () => { await base44.entities.Supplier.update(s.id, { status: s.status === 'Active' ? 'Inactive' : 'Active' }); load(); }}>
                        {s.status === 'Active' ? 'Set inactive' : 'Reactivate'}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-danger" onClick={async () => { await base44.entities.Supplier.delete(s.id); load(); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent></Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}