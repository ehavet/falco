export interface Crypter {
    encrypt(stringToEncrypt: string): string
    decrypt(base64StringToDecrypt: string): string
}
