export class ProviderHealthService {
  static async checkProviderHealth(provider: BaseProvider): Promise<boolean> {
    try {
      await provider.fetchUsers();
      return true;
    } catch {
      return false;
    }
  }
}
