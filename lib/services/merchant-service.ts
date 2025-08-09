export class MerchantService {
  async createMerchant(data: any) {
    // Merchant creation logic will go here
    return { id: 'merchant-id', ...data };
  }

  async getMerchant(id: string) {
    // Get merchant logic will go here
    return { id, name: 'Merchant Name' };
  }

  async updateMerchant(id: string, data: any) {
    // Update merchant logic will go here
    return { id, ...data };
  }

  async deleteMerchant(id: string) {
    // Delete merchant logic will go here
    return { success: true };
  }
}

export const merchantService = new MerchantService();
