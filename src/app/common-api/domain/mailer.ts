export interface MailerResponse {
    messageId: string
}

export interface Email {
    readonly sender: string
    readonly recipient: string,
    readonly subject: string,
    readonly messageText?: string,
    readonly messageHtml?: string
}

export interface Mailer {
    send(email: Email) : Promise<MailerResponse>
}
