import nodemailer from 'nodemailer'

// ── Transport ─────────────────────────────────────────────────
function getTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  // Default: Gmail with App Password
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    })
  }
  return null
}

const FROM = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'noreply@outriq.app'

// ── Send verification email ───────────────────────────────────
export async function sendVerificationEmail(toEmail, toName, code) {
  const transport = getTransport()

  if (!transport) {
    // No email config — log to console in dev
    console.log(`\n📧 VERIFICATION CODE for ${toEmail}: ${code}\n`)
    return { sent: false, demoCode: code }
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1c1917;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:0 20px;">
    <div style="background:#252220;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 36px;">

      <!-- Logo -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
        <div style="width:32px;height:32px;background:#cf6c4f;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div>
          <div style="font-size:15px;font-weight:700;color:#f5f0eb;letter-spacing:-0.3px;">OUTRIQ</div>
          <div style="font-size:9px;font-weight:600;color:#5a534d;letter-spacing:1.5px;text-transform:uppercase;">AI Marketing Engine</div>
        </div>
      </div>

      <h1 style="font-size:22px;font-weight:700;color:#f5f0eb;margin:0 0 8px;letter-spacing:-0.4px;">Verify your email</h1>
      <p style="font-size:14px;color:#8b847a;margin:0 0 28px;line-height:1.6;">
        Hi ${toName || 'there'}, enter this code to verify your OUTRIQ account:
      </p>

      <!-- Code -->
      <div style="background:#2f2c29;border:1px solid rgba(207,108,79,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:36px;font-weight:800;color:#f5f0eb;letter-spacing:12px;font-family:monospace;">${code}</div>
        <div style="font-size:12px;color:#5a534d;margin-top:8px;">Expires in 15 minutes</div>
      </div>

      <p style="font-size:13px;color:#5a534d;margin:0;line-height:1.6;">
        If you didn't create an OUTRIQ account, you can safely ignore this email.
      </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#5a534d;margin-top:20px;">© ${new Date().getFullYear()} OUTRIQ</p>
  </div>
</body>
</html>`

  await transport.sendMail({
    from: `OUTRIQ <${FROM}>`,
    to: toEmail,
    subject: `${code} — your OUTRIQ verification code`,
    html,
    text: `Your OUTRIQ verification code is: ${code}\n\nExpires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
  })

  return { sent: true }
}

// ── Send password reset email ────────────────────────────────
export async function sendPasswordResetEmail(toEmail, toName, code) {
  const transport = getTransport()

  if (!transport) {
    console.log(`\n🔑 PASSWORD RESET CODE for ${toEmail}: ${code}\n`)
    return { sent: false, demoCode: code }
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1c1917;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:0 20px;">
    <div style="background:#252220;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 36px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
        <div style="width:32px;height:32px;background:#cf6c4f;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div>
          <div style="font-size:15px;font-weight:700;color:#f5f0eb;letter-spacing:-0.3px;">OUTRIQ</div>
          <div style="font-size:9px;font-weight:600;color:#5a534d;letter-spacing:1.5px;text-transform:uppercase;">AI Marketing Engine</div>
        </div>
      </div>

      <h1 style="font-size:22px;font-weight:700;color:#f5f0eb;margin:0 0 8px;letter-spacing:-0.4px;">Reset your password</h1>
      <p style="font-size:14px;color:#8b847a;margin:0 0 28px;line-height:1.6;">
        Hi ${toName || 'there'}, enter this code to reset your OUTRIQ password:
      </p>

      <div style="background:#2f2c29;border:1px solid rgba(207,108,79,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:36px;font-weight:800;color:#f5f0eb;letter-spacing:12px;font-family:monospace;">${code}</div>
        <div style="font-size:12px;color:#5a534d;margin-top:8px;">Expires in 15 minutes</div>
      </div>

      <p style="font-size:13px;color:#5a534d;margin:0;line-height:1.6;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#5a534d;margin-top:20px;">© ${new Date().getFullYear()} OUTRIQ</p>
  </div>
</body>
</html>`

  await transport.sendMail({
    from: `OUTRIQ <${FROM}>`,
    to: toEmail,
    subject: `${code} — your OUTRIQ password reset code`,
    html,
    text: `Your OUTRIQ password reset code is: ${code}\n\nExpires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
  })

  return { sent: true }
}
