import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { notifyProcurementRoles, poVariables } from '../../shared/procurementNotify.ts';

// End-to-end procurement automation, run hourly by the Procurement Automation
// Sweep workflow (and available to admins on demand):
//   1. Matches an open order with its supplier receipt (same supplier, same amount).
//   2. Advances the matched order one step (Submitted -> Approved), so the next
//      sweep marks it Received - keeping every alert a step apart.
//   3. Reconciles money-out bank statement lines against received orders.
//   4. Emails management for receipt matches and payment reconciliations; the
//      Procurement Order Alerts workflow already alerts on status changes.
const norm = (s: any) => String(s || '').trim().toLowerCase();
const sameAmount = (a: any, b: any) => Math.abs(Number(a || 0) - Number(b || 0)) < 0.01;
const today = () => new Date().toISOString().slice(0, 10);

export default perBusiness(async function(req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;
    const [poPage, receiptPage, linePage] = await Promise.all([
      service.entities.PurchaseOrder.filter({ status: { $in: ['Submitted', 'Approved', 'Received'] } }, { sort: '-created_date', limit: 200 }),
      service.entities.Receipt.filter({ status: 'Unreconciled' }, { limit: 200 }),
      service.entities.BankStatementLine.filter({ reconciled: false, amount: { $lt: 0 } }, { limit: 200 }),
    ]);
    const orders = poPage.items || [];
    const receipts = receiptPage.items || [];
    const lines = linePage.items || [];
    const usedReceipts = new Set(orders.map((o: any) => o.receipt_id).filter(Boolean));
    let matched = 0;
    let advanced = 0;
    let reconciled = 0;

    // 1. Receipt matching: exactly one supplier receipt with the same amount.
    for (const po of orders) {
      if (po.receipt_id) continue;
      const candidates = receipts.filter((r: any) =>
        !usedReceipts.has(r.id) && norm(r.merchant) === norm(po.supplier_name) && sameAmount(r.amount, po.total)
      );
      if (candidates.length === 1) {
        const receipt = candidates[0];
        usedReceipts.add(receipt.id);
        await service.entities.PurchaseOrder.update(po.id, {
          receipt_id: receipt.id,
          matched_at: new Date().toISOString(),
          matched_by: 'Automation',
        });
        await service.entities.Receipt.update(receipt.id, { status: 'Reconciled' });
        matched++;
        await notifyProcurementRoles(base44, poVariables({ ...po, receipt_id: receipt.id }, 'supplier receipt matched automatically'));
      }
    }

    // 2. Advance matched orders one step per sweep.
    for (const po of orders) {
      if (po.status === 'Submitted' && po.receipt_id) {
        await service.entities.PurchaseOrder.update(po.id, { status: 'Approved', approved_by: 'Automation (receipt matched)' });
        advanced++;
      }
    }

    // 3. Payment reconciliation: bank line with the same outflow amount whose
    // description mentions the supplier, matched to a received/approved order.
    for (const po of orders) {
      if (!['Approved', 'Received'].includes(po.status) || !po.total) continue;
      const supplierToken = norm(po.supplier_name).split(' ').filter(Boolean)[0];
      if (!supplierToken) continue;
      const line = (lines as any[]).find((l) =>
        !l.matched_po_id && sameAmount(Math.abs(l.amount), po.total) &&
        norm(l.description).includes(supplierToken)
      );
      if (line) {
        await service.entities.BankStatementLine.update(line.id, {
          matched_po_id: po.id,
          reconciled: true,
          reconciled_at: new Date().toISOString(),
          reconciled_by: 'Automation',
        });
        reconciled++;
        await notifyProcurementRoles(base44, poVariables(po, 'payment reconciled automatically'));
      }
    }

    if (matched || advanced || reconciled) {
      await service.entities.AuditLog.create({
        action: 'Procurement automation sweep',
        entity_type: 'PurchaseOrder',
        performed_by: 'Automation',
        performed_by_role: 'system',
        details: `Receipts matched: ${matched}. Orders advanced: ${advanced}. Payments reconciled: ${reconciled}.`,
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json({ matched, advanced, reconciled });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});