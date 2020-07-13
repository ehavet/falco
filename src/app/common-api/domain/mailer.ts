export interface MailerResponse {
    messageId: string
}

export interface Email {
    readonly sender: string
    readonly recipient: string,
    readonly subject: string,
    readonly message: string
}

export interface Mailer {
    send(email: Email) : Promise<MailerResponse>
}
