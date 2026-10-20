import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { ShieldCheck, Download, CheckCircle2, RefreshCw } from "lucide-react";

const SCANS = [
  { entity: "Risk", label: "Risk" },
  { entity: "Incident", label: "Incident" },
  { entity: "Feedback", label: "Feedback" },
  { entity: "Complaint", label: "Complaint" },
  { entity: "IssueConcernBarrier", label: "Issue / Concern" },
  { entity: "TakeFive", label: "Take 5" },
  { entity: "SafetyCheck", label: "Safety check" },
];

const titleOf = (r) =>
  r.title || r.name || r.risk_name || r.summary || r.subject || r.feedback_type ||
  r.complaint_type || r.check_type || r.issue_type || r.item || "Untitled record";

const DAY = 24 * 60 * 60 * 1000;

function ageOf(r) {
  const base = r.review_completed_date || r.created_date;
  if (!base) return { days: 0, status: "current", base: null };
  const days = Math.floor((Date.now() - new Date(base).getTime()) / DAY);
  const status = days >= 89 ? "audit_due" : days >= 70 ? "overdue" : days >= 60 ? "due_soon" : "current";
  return { days, status, base: base.slice(0, 10) };
}

const TONES = {
  current: { chip: "bg-safe/10 text-safe border border-safe/30", text: "Current", row: "" },
  due_soon: { chip: "bg-warning/15 text-warning border border-warning/40", text: "Review due soon (yellow)", row: "bg-warning/10" },
  overdue: { chip: "bg-danger/15 text-danger border border-danger/40", text: "Overdue review (red)", row: "bg-danger/10" },
  audit_due: { chip: "bg-danger/20 text-danger border border-danger font-semibold", text: "Audit due (day before 3 months)", row: "bg-danger/15" },
};

const DATE = (v) => (v ? String(v).slice(0, 10) : "-");

export default function ReviewDueBoard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [marking, setMarking] = useState(null);
  const [me, setMe] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all(
      SCANS.map(async ({ entity, label }) => {
        try {
          const page = await base44.entities[entity].filter({}, { sort: "-created_date", limit: 300 });
          return (page.items || []).map((r) => ({ ...r, _entity: entity, _label: label, ...ageOf(r) }));
        } catch {
          return [];
        }
      })
    ).then((groups) => {
      setItems(groups.flat().sort((a, b) => b.days - a.days));
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  const counts = useMemo(() => {
    const c = { all: items.length, current: 0, due_soon: 0, overdue: 0, audit_due: 0 };
    items.forEach((i) => { c[i.status] += 1; });
    return c;
  }, [items]);

  const shown = filter === "all" ? items : items.filter((i) => i.status === filter);

  const markReviewed = async (item) => {
    setMarking(item.id);
    const today = new Date().toISOString().slice(0, 10);
    await base44.entities[item._entity].update(item.id, {
      review_completed_date: today,
      review_completed_by: me?.full_name || me?.email || "Unknown user",
      review_completed_by_id: me?.id || "",
      review_completed_at: new Date().toISOString(),
      review_alert_60_sent: false,
      review_alert_70_sent: false,
      review_alert_89_sent: false,
      review_status: "current",
    });
    setMarking(null);
    load();
  };

  const exportCsv = () => {
    const rows = [["Type", "Record", "Entered / last reviewed", "Days since", "Status", "Entered by", "Last review by", "Review completed"]];
    shown.forEach((i) => rows.push([
      i._label, titleOf(i), i.base || "-", i.days, TONES[i.status].text,
      i.created_by || "-", i.review_completed_by || "-", i.review_completed_date || "-",
    ]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `review-audit-board-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review & Audit Board"
        subtitle="Every risk, incident, feedback, complaint, issue, take 5 and safety check, aged for review: yellow at 2 months, red at 10 weeks, audit due the day before 3 months"
        icon={ShieldCheck}
        moduleKey="compliance"
      />

      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "all", label: `All (${counts.all})` },
          { key: "due_soon", label: `Yellow - review due (${counts.due_soon})` },
          { key: "overdue", label: `Red - overdue (${counts.overdue})` },
          { key: "audit_due", label: `Audit due (${counts.audit_due})` },
          { key: "current", label: `Current (${counts.current})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === t.key ? "border-brand bg-brand text-brand-foreground" : "border-border bg-background hover:bg-muted"}`}
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={shown.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Loading review board...</CardContent></Card>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          moduleKey="compliance"
          title="Nothing needs review"
          message="No records match this filter. Items turn yellow 2 months after entry and red at 10 weeks."
        />
      ) : (
        <div className="space-y-2">
          {shown.map((i) => {
            const tone = TONES[i.status];
            return (
              <div key={`${i._entity}-${i.id}`} className={`flex flex-wrap items-center gap-3 rounded-xl border border-border px-4 py-3 ${tone.row}`}>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tone.chip}`}>{tone.text}</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">{i._label}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{titleOf(i)}</span>
                <span className="text-xs text-muted-foreground">Entered / last reviewed: <b className="text-foreground">{i.base || "-"}</b></span>
                <span className="text-xs text-muted-foreground">{i.days} days</span>
                <span className="text-xs text-muted-foreground">By: <b className="text-foreground">{i.review_completed_by || i.created_by || "-"}</b></span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markReviewed(i)}
                  disabled={marking === i.id}
                  className="shrink-0"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> {marking === i.id ? "Recording..." : "Mark reviewed"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}