"use client"

import { useState, useEffect } from "react"
import { X, Mail } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase"

interface Contact {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

interface Props {
  initialContacts: Contact[]
}

export function ContactsTableModal({ initialContacts }: Props) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [selected, setSelected] = useState<Contact | null>(null)
  const supabase = createSupabaseBrowserClient()

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [selected])

  async function toggleRead(id: string, newRead: boolean) {
    // Optimistic update first — no router.refresh() to avoid race with server re-render
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, read: newRead } : c))
    )
    setSelected((prev) => (prev?.id === id ? { ...prev, read: newRead } : prev))
    await supabase.from("contacts").update({ read: newRead }).eq("id", id)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-soft uppercase w-8">Leído</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-soft uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-soft uppercase hidden sm:table-cell">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-soft uppercase hidden md:table-cell">Asunto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-soft uppercase hidden lg:table-cell">Mensaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-soft uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown/5">
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => setSelected(contact)}
                  className={`cursor-pointer transition-colors ${
                    contact.read
                      ? "hover:bg-cream/40"
                      : "bg-terracota/5 hover:bg-terracota/10"
                  }`}
                >
                  {/* Checkbox — stop propagation so clicking it doesn't open modal */}
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={contact.read}
                      onChange={(e) => toggleRead(contact.id, e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded accent-terracota"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-text-main">
                    {contact.name}
                    {!contact.read && (
                      <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-terracota align-middle" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-soft hidden sm:table-cell">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-soft max-w-40 truncate hidden md:table-cell">
                    {contact.subject ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-main max-w-xs hidden lg:table-cell">
                    <p className="line-clamp-1">{contact.message}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-soft whitespace-nowrap">
                    {new Date(contact.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-lg flex flex-col max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-brown px-6 py-5 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <p className="text-cream/70 text-xs uppercase tracking-wide mb-0.5">Mensaje de</p>
                <h2 className="font-serif text-xl text-cream truncate">{selected.name}</h2>
                <p className="text-cream/60 text-sm mt-0.5 truncate">{selected.email}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-full p-1.5 text-cream/70 hover:bg-white/10 hover:text-cream transition-colors mt-0.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="bg-white flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Subject */}
              {selected.subject && (
                <div>
                  <p className="text-xs text-text-soft uppercase tracking-wide mb-1">Asunto</p>
                  <p className="font-serif text-xl text-text-main leading-snug">{selected.subject}</p>
                </div>
              )}

              {/* Date + read badge */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-text-soft capitalize">{formatDate(selected.created_at)}</p>
                <button
                  onClick={() => toggleRead(selected.id, !selected.read)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selected.read
                      ? "bg-brown/10 text-brown hover:bg-brown/20"
                      : "bg-terracota/15 text-terracota hover:bg-terracota/25"
                  }`}
                >
                  {selected.read ? "✓ Leído" : "● No leído"}
                </button>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-text-soft uppercase tracking-wide mb-2">Mensaje</p>
                <div className="rounded-xl bg-cream px-4 py-4">
                  <p className="text-sm text-text-main whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-brown/10 px-6 py-4 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-text-soft hover:text-text-main transition-colors"
              >
                Cerrar
              </button>
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject ?? "tu mensaje")}`}
                className="flex items-center gap-2 rounded-full bg-terracota px-5 py-2.5 text-sm font-medium text-white hover:bg-brown transition-colors"
              >
                <Mail className="h-4 w-4" />
                Responder
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
