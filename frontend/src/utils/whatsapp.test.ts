import { describe, expect, it } from 'vitest'
import { createPropertyWhatsAppMessage } from './whatsapp'

describe('createPropertyWhatsAppMessage', () => {
  it('creates the required property inquiry message', () => {
    expect(createPropertyWhatsAppMessage('Villa Ouaga', 'JEF-001')).toBe(
      "Bonjour, je suis intéressé par le bien Villa Ouaga, référence JEF-001. Je souhaite avoir plus d'informations.",
    )
  })
})
