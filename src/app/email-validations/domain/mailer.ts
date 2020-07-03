export interface MailerResponse {
    messageId: string
}

export interface Email {
    sender: string
    recipient: string,
    subject: string,
    message: string
}

export interface Mailer {
    send(email: Email) : Promise<MailerResponse>
}
