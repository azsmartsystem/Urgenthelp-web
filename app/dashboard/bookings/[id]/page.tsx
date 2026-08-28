import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';
import { TrackingMap } from '@/components/TrackingMap';
import { BookingActions } from '@/components/BookingActions';
import { ReviewForm } from '@/components/ReviewForm';
import { ReportIssueForm } from '@/components/ReportIssueForm';
import { SignedImage } from '@/components/SignedImage';

const STATUS_LABEL: Record<string, string> = {
  requested: 'Finding helpers',
  matched: 'Helpers notified',
  accepted: 'Helper confirmed',
  en_route: 'Helper en route',
  in_progress: 'Service in progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) redirect('/login');

  const { data: booking } = await supabase
    .from('bookings')
    .select(
      `*, services(name), addresses(line1, city),
       customer_profiles(id, user_id, display_name),
       helper_profiles(id, user_id, display_name, trust_score_cached)`
    )
    .eq('id', params.id)
    .single();

  if (!booking) notFound();

  const isCustomer = (booking as any).customer_profiles.user_id === appUser.id;
  const isHelper = (booking as any).helper_profiles?.user_id === appUser.id;
  if (!isCustomer && !isHelper) notFound();

  const { data: payment } = await supabase.from('payments').select('*').eq('booking_id', booking.id).maybeSingle();
  const { data: conversation } = await supabase.from('conversations').select('id').eq('booking_id', booking.id).maybeSingle();
  const { data: myReview } = await supabase.from('reviews').select('id').eq('booking_id', booking.id).eq('reviewer_id', appUser.id).maybeSingle();
  const { data: media } = await supabase.from('booking_media').select('file_id, stage').eq('booking_id', booking.id);

  const showTracking = ['accepted', 'en_route', 'in_progress'].includes(booking.status);
  const showReview = booking.status === 'completed' && !myReview;

  const { data: existingDispute } = await supabase
    .from('disputes')
    .select('id, status')
    .eq('booking_id', booking.id)
    .eq('raised_by', appUser.id)
    .order('created_at', { ascending: false })
    .maybeSingle();

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel">
        <Logo />
        <NavBar />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-ink">{booking.services?.name}</h1>
            <p className="text-xs text-ink-faint mt-1">{booking.addresses?.line1}, {booking.addresses?.city}</p>
          </div>
          <span className="badge badge-navy">{STATUS_LABEL[booking.status] ?? booking.status}</span>
        </div>

        {showTracking && (
          <div className="mt-6">
            <TrackingMap bookingId={booking.id} />
          </div>
        )}

        <div className="card p-5 mt-6">
          <div className="text-[11px] font-bold text-ink-faint uppercase mb-3">
            {isCustomer ? 'Your helper' : 'Customer'}
          </div>
          <div className="font-bold text-ink">
            {isCustomer ? (booking as any).helper_profiles?.display_name ?? 'Not yet assigned' : (booking as any).customer_profiles.display_name}
          </div>
          {conversation && (
            <Link href={`/messages/${conversation.id}`} className="text-brand text-xs font-bold mt-2 inline-block">
              Open messages →
            </Link>
          )}
        </div>

        <div className="card p-5 mt-4">
          <div className="text-[11px] font-bold text-ink-faint uppercase mb-3">Pricing</div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-soft">Estimated</span>
            <span className="font-bold text-ink">
              ₦{booking.price_min?.toLocaleString()} – ₦{booking.price_max?.toLocaleString()}
            </span>
          </div>
          {booking.final_price && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-ink-soft">Final price</span>
              <span className="font-bold text-ink">₦{booking.final_price.toLocaleString()}</span>
            </div>
          )}
          {payment && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-ink-soft">Payment status</span>
              <span className={`font-bold ${payment.status === 'successful' ? 'text-success' : 'text-amber-400'}`}>
                {payment.status}
              </span>
            </div>
          )}
        </div>

        {media && media.length > 0 && (
          <div className="card p-5 mt-4">
            <div className="text-[11px] font-bold text-ink-faint uppercase mb-3">Photos</div>
            <div className="flex gap-2 flex-wrap">
              {media.map((m) => (
                <SignedImage key={m.file_id} fileId={m.file_id} className="w-20 h-20 rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            role={isHelper ? 'helper' : 'customer'}
            hasPayment={Boolean(payment && payment.status === 'successful')}
          />
        </div>

        {showReview && (
          <div className="mt-6">
            <ReviewForm bookingId={booking.id} />
          </div>
        )}

        {!['cancelled'].includes(booking.status) && (
          <div className="mt-4">
            {existingDispute ? (
              <div className="card p-4 text-sm text-ink-soft">
                Report submitted — status: <span className="capitalize font-semibold text-ink">{existingDispute.status.replace('_', ' ')}</span>
              </div>
            ) : (
              <ReportIssueForm bookingId={booking.id} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
