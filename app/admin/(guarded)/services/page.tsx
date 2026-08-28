import { createServiceRoleClient } from '@/lib/supabase/server';
import { ServiceToggle } from '@/components/admin/ServiceToggle';
import { NewServiceForm } from '@/components/admin/NewServiceForm';
import { SeedCatalogButton } from '@/components/admin/SeedCatalogButton';

export default async function AdminServicesPage() {
  const supabase = createServiceRoleClient();
  const { data: categories } = await supabase.from('service_categories').select('*').order('sort_order');
  const { data: services } = await supabase.from('services').select('*, service_categories(name)').order('name');

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-6">Services & categories</h1>

      <SeedCatalogButton currentServiceCount={services?.length ?? 0} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-ink-faint text-[11px] font-bold uppercase">
              <tr>
                <th className="text-left px-4 py-3">Service</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Price range</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {(services ?? []).map((s: any) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold text-ink">{s.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{s.service_categories?.name}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    ₦{s.base_price_min?.toLocaleString()} – ₦{s.base_price_max?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.is_active ? 'badge-verified' : 'badge-danger'}`}>{s.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ServiceToggle serviceId={s.id} isActive={s.is_active} />
                  </td>
                </tr>
              ))}
              {(!services || services.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-faint">
                    No services yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="font-extrabold text-ink text-sm mb-4">Add a service</h2>
          <NewServiceForm categories={categories ?? []} />
        </div>
      </div>
    </div>
  );
}
