import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth?redirect=admin")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: string | null } | null }

  if (profile?.role !== "admin") redirect("/")

  // Badge de contactos sin leer
  const admin = createSupabaseAdminClient()
  const { count: unreadContacts } = await admin
    .from("contacts")
    .select("*", { count: "exact", head: true })
    .eq("read", false)

  return (
    <AdminShell unreadContacts={unreadContacts ?? 0}>
      {children}
    </AdminShell>
  )
}
