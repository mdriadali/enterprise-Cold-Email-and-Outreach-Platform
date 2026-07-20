export function generateEmailTemplate(campaignEmail: {
  greeting: string;
  body: string;
  signature?: string | null;
}): string {
  const formattedBody = campaignEmail.body.replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#222;font-size:16px;line-height:1.6;">

<div style="max-width:650px;padding:24px;">

<p style="margin:0 0 18px;">
${campaignEmail.greeting},
</p>

<p style="margin:0 0 18px;">
${formattedBody}
</p>

${campaignEmail.signature
      ? `
<p style="margin-top:28px;">
${campaignEmail.signature}
</p>
`
      : ""
    }

</div>

</body>
</html>
`;
}