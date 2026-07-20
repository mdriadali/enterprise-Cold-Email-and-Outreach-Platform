export function generatePlainText(campaignEmail: {
    greeting: string;
    body: string;
    signature?: string | null;
}): string {
    return `${campaignEmail.greeting},

${campaignEmail.body}

${campaignEmail.signature ?? ""}`;
}