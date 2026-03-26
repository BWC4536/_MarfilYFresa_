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

  const unread = contacts?.filter((c) => !c.read).length ?? 0

  return (
    <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl text-text-main">Contactos</h1>
          {unread > 0 && (
            <span className="rounded-full bg-terracota px-3 py-0.5 text-xs font-medium text-white">
              {unread} sin leer
            </span>
          )}
        </div>
        <p className="text-text-soft text-sm">{contacts?.length ?? 0} mensajes</p>
      </div>

      {!contacts || contacts.length === 0 ? (
        <div className="rounded-2xl bg-white flex items-center justify-center py-16 text-text-soft text-sm">
          No hay mensajes todavía
        </div>
      ) : (
        <ContactsTableModal initialContacts={contacts} />
      )}
    </div>
  )
}
