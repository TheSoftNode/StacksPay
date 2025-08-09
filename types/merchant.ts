export interface Merchant {
  id: string;
  name: string;
  email: string;
  businessType: string;
  website?: string;
  apiKeys: ApiKey[];
  webhookUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  keyId: string;
  keyHash: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
}
