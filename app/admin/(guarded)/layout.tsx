import { Logo } from '@/components/Logo';
import { AdminNav } from '@/components/AdminNav';
import { requireAdmin } from '@/lib/auth/admin-guard';

// Route group (guarded) covers every /admin/* page except /admin/login,
// which lives outside this group specifically so it never hits
// requireAdmin() — that would otherwise be a redirect loop (unauthenticated
// -> redirect to /admin/login -> layout guards /admin/login -> redirect...).
export default async function AdminGuardedLayout({ children }: { children: React.ReactNode }) {
  const { admin, role } = await requireAdmin();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[230px_1fr] bg-surface">
      <aside className="bg-navy px-3 py-3 md:p-5 flex items-center md:flex-col md:items-stretch gap-3 md:gap-0 overflow-x-auto">
        <div className="text-white shrink-0 md:mb-6">
          <Logo />
        </div>
        <AdminNav adminEmail={admin.email} role={role} />
      </aside>
      <main className="p-4 md:p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
