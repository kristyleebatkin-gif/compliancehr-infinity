import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const APP_URL = 'https://polite-safe-hire-flow.base44.app';

// Next review cadence by review type.
function nextDateFor(reviewType) {
  const from = new Date();
  const add = (months) => { from.setUTCMonth(from.getUTCMonth() + months); return from.toISOString().slice(0, 10); };
  switch (String(reviewType || '')) {
    case 'Annual Review': return add(12);
    case '6-Month Review': return add(6);
    case 'Probation': return add(6);
    case 'Return from Leave': return add(6);
    default: return add(12);
  }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const reviewId = String(body.entity_id || '').trim();
    if (!reviewId) return Response.json({ error: 'Review id required' }, { status: 400 });

    const review = await service.entities.PerformanceReview.get(reviewId);
    if (!review || review.status !== 'Completed') {
      return Response.json({ ok: true, skipped: true, reason: 'review not completed' });
    }
    if (review.next_review_date) {
      return Response.json({ ok: true, skipped: true, reason: 'next review already scheduled' });
    }

    const staffName = review.staff_name || 'Staff member';
    const nextDate = nextDateFor(review.review_type);

    // Stamp the next review date on the completed review.
    await service.entities.PerformanceReview.update(reviewId, { next_review_date: nextDate });

    // Create the follow-up review task for the reviewer / manager.
    const dueDate = nextDate;
    const taskTitle = `${review.review_type || 'Performance'} review follow-up - ${staffName}`;
    const existing = await service.entities.Task.filter(
      { title: taskTitle, task_type: 'Review Reminder', archived: { $ne: true } }, { limit: 1 },
    );
    let created = false;
    if (!(existing.items || []).length) {
      await service.entities.Task.create({
        title: taskTitle,
        task_type: 'Review Reminder',
        assigned_to: review.reviewer || 'Kristy Batkin',
        due_date: dueDate,
        status: 'Open',
        priority: 'Medium',
        linked_entity_type: 'PerformanceReview',
        linked_entity_id: reviewId,
        notes: `Auto-created when the ${review.review_type || 'review'} for ${staffName} was completed. Schedule the ${nextDate <= String(review.review_date || '') ? 'next' : 'follow-up'} review on or before this date. Open reviews: ${APP_URL}/hr`,
      });
      created = true;
    }

    return Response.json({ ok: true, next_review_date: nextDate, task_created: created });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}