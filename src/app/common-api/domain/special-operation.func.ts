import { OperationCode } from './operation-code'

export namespace SpecialOperation {

    export function inferOperationCode (operationCode?: string): OperationCode {
      if (operationCode) {
        const parsedCode: string = operationCode.replace(/[\W_]+/g, '').toUpperCase()
        return OperationCode[parsedCode] || OperationCode.UNKNOW
      }
      return OperationCode.BLANK
    }
}
