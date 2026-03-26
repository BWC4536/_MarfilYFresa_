import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { ContactsTableModal } from "@/components/admin/contacts-table-modal"

interface Contact {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export default async function AdminContactosPage() {
  const admin = createSupabaseAdminClient()

  const { data: contacts } = (await admin
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })) as { data: Contact[] | null }

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <ContactsTableModal initialContacts={contacts ?? []} />
    </div>
  )
}
