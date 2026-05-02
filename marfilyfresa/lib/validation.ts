/**
 * Funciones de validación y sanitización para proteger contra inyecciones
 */

/**
 * Escapa caracteres HTML para prevenir XSS
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Valida un email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Valida un teléfono (números, espacios, +, -, paréntesis)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s+\-()]{6,20}$/
  return phoneRegex.test(phone)
}

/**
 * Valida nombre (sin caracteres especiales peligrosos)
 */
export function validateName(name: string): boolean {
  // Permite letras, números, espacios, acentos, guiones
  const nameRegex = /^[a-zA-Z0-9\s\-áéíóúñÁÉÍÓÚÑ]{1,100}$/
  return nameRegex.test(name.trim())
}

/**
 * Limpia un string de entrada: trimea y valida longitud
 */
export function cleanString(input: string | null | undefined, maxLength: number = 1000): string {
  if (!input) return ""
  return input.trim().substring(0, maxLength)
}

/**
 * Valida dirección (similar a nombre pero más permisivo)
 */
export function validateAddress(address: string): boolean {
  // Permite direcciones con números, letras, comas, guiones, etc
  const addressRegex = /^[a-zA-Z0-9\s\-,áéíóúñÁÉÍÓÚÑ()/.]{1,255}$/
  return addressRegex.test(address.trim())
}

/**
 * Valida nota/mensaje (mensaje largo, permite saltos de línea)
 */
export function validateMessage(message: string, maxLength: number = 5000): boolean {
  if (!message || message.trim().length === 0) return false
  if (message.length > maxLength) return false
  // Valida que no tenga caracteres de control peligrosos
  return !/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/.test(message)
}

/**
 * Objeto con todas las validaciones necesarias para crear un pedido
 */
export function validateOrderInput(data: {
  customerName?: unknown
  customerPhone?: unknown
  customerAddress?: unknown
  notes?: unknown
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validar nombre
  if (!data.customerName || typeof data.customerName !== "string") {
    errors.push("Nombre inválido")
  } else if (!validateName(data.customerName)) {
    errors.push("Nombre contiene caracteres inválidos")
  } else if (data.customerName.trim().length < 2) {
    errors.push("Nombre muy corto")
  }

  // Validar teléfono
  if (!data.customerPhone || typeof data.customerPhone !== "string") {
    errors.push("Teléfono inválido")
  } else if (!validatePhone(data.customerPhone)) {
    errors.push("Formato de teléfono inválido")
  }

  // Validar dirección
  if (!data.customerAddress || typeof data.customerAddress !== "string") {
    errors.push("Dirección inválida")
  } else if (!validateAddress(data.customerAddress)) {
    errors.push("Dirección contiene caracteres inválidos")
  } else if (data.customerAddress.trim().length < 5) {
    errors.push("Dirección muy corta")
  }

  // Validar notas (opcional pero si existen, validar)
  if (data.notes && typeof data.notes === "string") {
    if (!validateMessage(data.notes, 1000)) {
      errors.push("Notas contienen caracteres inválidos o son muy largas")
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Objeto con todas las validaciones para formulario de contacto
 */
export function validateContactInput(data: {
  name?: unknown
  email?: unknown
  subject?: unknown
  message?: unknown
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validar nombre
  if (!data.name || typeof data.name !== "string") {
    errors.push("Nombre requerido")
  } else if (!validateName(data.name)) {
    errors.push("Nombre contiene caracteres inválidos")
  }

  // Validar email
  if (!data.email || typeof data.email !== "string") {
    errors.push("Email requerido")
  } else if (!validateEmail(data.email)) {
    errors.push("Email inválido")
  }

  // Validar asunto (opcional pero si existe, validar)
  if (data.subject && typeof data.subject === "string") {
    if (data.subject.trim().length > 200) {
      errors.push("Asunto muy largo")
    }
  }

  // Validar mensaje
  if (!data.message || typeof data.message !== "string") {
    errors.push("Mensaje requerido")
  } else if (!validateMessage(data.message)) {
    errors.push("Mensaje contiene caracteres inválidos")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
