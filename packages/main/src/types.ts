export interface IFormattedOutboundData {
  code: string;
  buyCompany: string;
  date: number;
  product: string;
  productType: string;
  unit: string;
  count: number;
  notes: string;
}

export interface IFormattedInboundData {
  date: number;
  product: string;
  unit: string;
  count: number;
}

export interface IFormattedIssuingData {
  date: number;
  product: string;
  unit: string;
  count: number;
}

export interface IFormattedReceivingData {
  date: number;
  sellCompany: string;
  product: string;
  productType: string;
  unit: string;
  specification: string;
  count: number;
}
