import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json()

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required.' }, { status: 400 })
    }

    const recipient = process.env.CONTACT_TO_EMAIL
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'

    if (!recipient || !resend) {
      return NextResponse.json(
        {
          error:
            'Email delivery is not configured yet. Set RESEND_API_KEY and CONTACT_TO_EMAIL in your environment.',
        },
        { status: 500 },
      )
    }

    const { data, error } = await resend.emails.send({
      from: `REPLAY Arcade <${fromEmail}>`,
      to: [recipient],
      replyTo: email,
      subject: `New contact form message from ${email}`,
      text: `From: ${email}\n\n${message}`,
      html: `<p><strong>From:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br />')}</p>`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Unable to send message right now.' }, { status: 500 })
  }
}
