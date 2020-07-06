export interface PolicyRepository {
    isIdAvailable(policyId: string): Promise<boolean>,
}
