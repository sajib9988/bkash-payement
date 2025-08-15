export interface CapturePaymentPayload {
  dbOrderId: string;
  userId: string;
  shippingPhone: string;
  shippingName: string;
  shippingStreet: string;
  shippingDistrict: string;
  shippingZone: string;
  address?: string;
  shippingZip?: string;
}


// src/types/paypal.types.ts
export interface CreateOrderBody {
  intent: "CAPTURE" | "AUTHORIZE";
  purchase_units: {
    amount: {
      currency_code: string;
      value: string;
    };
  }[];
  application_context?: {
    return_url: string;
    cancel_url: string;
    user_action?: "PAY_NOW" | "CONTINUE";

  };
}


export interface CapturePaymentResponse {
  id: string;
  status: string;
  purchase_units: any[];
}

export interface CreateInvoicePayload {
  detail: {
    invoice_number: string;
    currency_code: string;
    note?: string;
    terms_and_conditions?: string;
  };
  invoicer: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
  };
  primary_recipients: Array<{
    billing_info: {
      name: {
        given_name: string;
        surname: string;
      };
      email_address: string;
    };
  }>;
  items: Array<{
    name: string;
    quantity: string;
    unit_amount: {
      currency_code: string;
      value: string;
    };
  }>;
}
