import { createServiceRoleClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function AdminBookingDetail({ params }: { params: { id: string } }) {
  const supabase = createServiceRoleClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(name), customer_profiles(display_name), helper_profiles(display_name), addresses(line1, city)')
    .eq('id', params.id)
    .single();
  if (!booking) notFound();

  const { data: history } = await supabase
    .from('booking_status_history')
    .select('*')
    .eq('booking_id', params.id)
    .order('changed_at', { ascending: true });

  const { data: payment } = await supabase.from('payments').select('*').eq('booking_id', params.id).maybeSingle();

  return (
    <div className="max-w-2xl">
      <a href="/admin/bookings" className="text-xs text-ink-faint font-bold">
        ← Back to bookings
      </a>
      <h1 className="text-2xl font-extrabold text-ink mt-2">{(booking as any).services?.name}</h1>
      <span className="badge badge-navy capitalize mt-2">{booking.status.replace('_', ' ')}</span>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="card p-4">
          <div className="text-[11px] font-bold text-ink-faint">CUSTOMER</div>
          <div className="font-semibold text-ink mt-1">{(booking as any).customer_profiles?.display_name ?? '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-bold text-ink-faint">HELPER</div>
          <div className="font-semibold text-ink mt-1">{(booking as any).helper_profiles?.display_name ?? 'Not yet matched'}</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-bold text-ink-faint">LOCATION</div>
          <div className="font-semibold text-ink mt-1">
            {(booking as any).addresses?.line1}, {(booking as any).addresses?.city}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] font-bold text-ink-faint">PRICE</div>
          <div className="font-semibold text-ink mt-1">₦{(booking.final_price ?? booking.price_recommended ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {payment && (
        <div className="card p-4 mt-4">
          <div className="text-[11px] font-bold text-ink-faint">PAYMENT</div>
          <div className="flex justify-between mt-1">
            <span className="text-sm text-ink-soft">{payment.provider} · {payment.provider_reference}</span>
            <span className={`badge ${payment.status === 'successful' ? 'badge-verified' : payment.status === 'failed' ? 'badge-danger' : 'badge-amber'}`}>
              {payment.status}
            </span>
          </div>
        </div>
      )}

      <h2 className="font-extrabold text-ink text-sm mt-6 mb-3">Status history</h2>
      <div className="card p-4">
        {(history ?? []).map((h, i) => (
          <div key={h.id} className="flex justify-between items-center py-2 border-t border-line first:border-t-0 text-sm">
            <span className="font-semibold text-ink capitalize">{h.to_status.replace('_', ' ')}</span>
            <span className="text-ink-faint text-xs">{new Date(h.changed_at).toLocaleString()}</span>
          </div>
        ))}
        {(!history || history.length === 0) && <p className="text-sm text-ink-faint">No history recorded.</p>}
      </div>
    </div>
  );
}
