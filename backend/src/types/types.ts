export interface RfpStructuredData {
  subject: string;
  body: string;
}

export interface SendRfpRequest {
  rfpId: number;
  email: string | string[];
}

export interface MailgunInboundEmail {
  sender?: string;
  from?: string;
  recipient: string;
  subject?: string;
  "body-plain"?: string;
  "body-html"?: string;
  "Message-Id"?: string;
  "In-Reply-To"?: string;
  References?: string;
}

export interface VendorReply {
  vendorEmail: string;
  summary: string;
}