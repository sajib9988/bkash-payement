export interface IResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data?: any;
    meta?: {
        page: number;
        limit: number;
        skip: number;
        total: number
    }
}



export interface BkashCallbackPayload {
  paymentID: string;
  status?: 'COMPLETED' | 'FAILED' | 'PENDING';
  trxID?: string;
}


  // types/bkash.ts

export type CreateBkashPaymentParams = {
  amount: string;
  userId: string;
};

export type BkashPaymentResponse = {
  paymentID: string;
  createTime: string;
  intent: string;
  merchantInvoiceNumber: string;
  bkashURL: string;
  [key: string]: any; // বাকি ফিল্ড থাকলে handle করার জন্য
};

  
  export interface IOptionsMedia {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  

