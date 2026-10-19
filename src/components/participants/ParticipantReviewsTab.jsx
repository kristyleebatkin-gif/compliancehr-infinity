import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { statusTone } from '@/lib/statusStyles';

export default function ParticipantReviewsTab({ participant }) {
  const [reviews, setReviews] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.ParticipantReview.filter(
        { participant_id: participant.id },
        { sort: '-review_date', limit: 200 },
      ),
      base44.entities.SatisfactionSurvey.filter(
        { participant_name: participant.full_name },
        { sort: '-survey_date', limit: 200 },
      ),
      base44.entities.Complaint.filter(
        { participant_id: participant.id },
        { sort: '-date_received', limit: 200 },
      ),
    ])
      .then(([reviewPage, surveyPage, complaintPage]) => {
        setReviews(reviewPage.items || []);
        setSurveys(surveyPage.items || []);
        setComplaints(complaintPage.items || []);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [participant.id, participant.full_name]);

  if (loading) return <div className="py-4 text-center text-sm text-foreground/50">Loading reviews, surveys and complaints...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Reviews</h3>
        {reviews.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No reviews scheduled or completed for this participant.</div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{review.review_type || 'Review'} · {review.review_date || 'No date'}</div>
                  <div className="truncate text-xs text-foreground/50">{review.reviewer ? `Reviewer: ${review.reviewer}` : ''}{review.next_review_due ? ` · Next due: ${review.next_review_due}` : ''}</div>
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(review.status)}`}>{review.status || 'Scheduled'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Satisfaction Surveys</h3>
        {surveys.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No satisfaction surveys for this participant.</div>
        ) : (
          <div className="space-y-2">
            {surveys.map((survey) => (
              <div key={survey.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">Survey · {survey.survey_date || 'No date'}</div>
                  <div className="truncate text-xs text-foreground/50">
                    {survey.overall_rating ? `Overall: ${survey.overall_rating}/5 · ` : ''}{survey.comments || ''}
                  </div>
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(survey.status)}`}>{survey.status || 'Pending'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/60">Complaints</h3>
        {complaints.length === 0 ? (
          <div className="py-4 text-center text-sm text-foreground/50">No complaints recorded for this participant.</div>
        ) : (
          <div className="space-y-2">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{complaint.title || complaint.complaint_id || 'Complaint'}</div>
                  <div className="truncate text-xs text-foreground/50">{complaint.date_received || 'No date'} · {complaint.category || 'Other'}</div>
                </div>
                <span className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${statusTone(complaint.status)}`}>{complaint.status || 'Received'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}