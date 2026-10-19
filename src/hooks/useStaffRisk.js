import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';

const PENDING = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'];

// Loads and scores a staff member's compliance risk (same formula everywhere):
// 100 minus deductions for overdue tasks, expired documents/certificates and
// items expiring within 30 days.
export default function useStaffRisk(staff) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const name = staff?.full_name;
    const today = format(new Date(), 'yyyy-MM-dd');
    const in30 = format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd');
    Promise.all([
      base44.entities.TodoTask.filter(
        { status: { $in: PENDING }, assigned_to: name },
        { sort: 'due_date', limit: 100, fields: ['title', 'due_date', 'priority', 'status'] },
      ),
      base44.entities.EmployeeDocument.filter(
        { employee_id: staff?.id },
        { limit: 100, fields: ['title', 'document_type', 'status', 'expiry_date'] },
      ),
      base44.entities.Certificate.filter(
        { staff_name: name },
        { limit: 100, fields: ['module_title', 'status', 'expiry_date'] },
      ),
    ])
      .then(([tasks, docs, certs]) => {
        if (cancelled) return;
        const overdueTasks = (tasks.items || []).filter((t) => t.due_date && t.due_date < today);
        const dueTasks = (tasks.items || []).filter((t) => t.due_date && t.due_date >= today);
        const expiredDocs = (docs.items || []).filter((d) => d.expiry_date && d.expiry_date < today);
        const soonDocs = (docs.items || []).filter((d) => d.expiry_date && d.expiry_date >= today && d.expiry_date <= in30);
        const expiredCerts = (certs.items || []).filter((c) => c.expiry_date && c.expiry_date < today);
        const soonCerts = (certs.items || []).filter((c) => c.expiry_date && c.expiry_date >= today && c.expiry_date <= in30);

        const score = Math.max(0, Math.min(100,
          100
          - overdueTasks.length * 10
          - expiredDocs.length * 15
          - expiredCerts.length * 15
          - soonDocs.length * 5
          - soonCerts.length * 5
        ));
        setData({
          score,
          overdueTasks, dueTasks,
          expiredDocs, soonDocs, expiredCerts, soonCerts,
        });
      })
      .catch(() => {
        if (!cancelled) setData({ score: 100, overdueTasks: [], dueTasks: [], expiredDocs: [], soonDocs: [], expiredCerts: [], soonCerts: [] });
      });
    return () => { cancelled = true; };
  }, [staff?.id, staff?.full_name]);

  return data;
}