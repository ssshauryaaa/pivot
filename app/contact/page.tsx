import type { Metadata } from 'next'
import { ContactContent } from '@/components/contact/contact-content'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Questions about hours, tokens, or the high-score board? Send REPLAY a message — two fields, quick reply, no forms-department nonsense.',
}

export default function ContactPage() {
  return <ContactContent />
}
