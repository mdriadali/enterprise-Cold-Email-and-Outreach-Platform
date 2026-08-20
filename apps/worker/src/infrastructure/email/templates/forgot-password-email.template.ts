export function generateForgotPasswordEmailTemplate(data: {
    name: string;
    link: string;
    expiresInMinutes: number;
}): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#222;font-size:16px;line-height:1.6;">
  <div style="max-width:650px;padding:24px;">
    <h1 style="margin:0 0 18px;font-size:22px;">Reset your password</h1>
    <p style="margin:0 0 18px;">Hi ${data.name},</p>
    <p style="margin:0 0 18px;">We received a request to reset your password. Click the button below to choose a new password. This link expires in ${data.expiresInMinutes} minutes.</p>
    <p style="margin:0 0 24px;">
      <a href="${data.link}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Reset Password</a>
    </p>
    <p style="margin:0 0 18px;">If the button does not work, copy and paste this link into your browser:</p>
    <p style="margin:0 0 18px;word-break:break-all;color:#2563eb;">${data.link}</p>
    <p style="margin:0;color:#737686;font-size:13px;">If you did not request a password reset, you can safely ignore this email.</p>
  </div>
</body>
</html>
`;
}

export function generateForgotPasswordPlainText(data: {
    name: string;
    link: string;
    expiresInMinutes: number;
}): string {
    return `Hi ${data.name},

We received a request to reset your password. Click the link below to choose a new password. This link expires in ${data.expiresInMinutes} minutes.

Reset your password: ${data.link}

If you did not request a password reset, you can safely ignore this email.`;
}
