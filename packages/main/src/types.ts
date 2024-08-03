export interface IFormattedOutboundInvoicesData {
  code: string;
  buyCompany: string;
  date: number;
  product: string;
  productType: string;
  unit: string;
  count: number;
  notes: string;
  price: number;
  tax: number;
}

export interface IFormattedInboundData {
  date: number;
  product: string;
  unit: string;
  count: number;
}

export interface IFormattedMaterialData {
  date: number;
  product: string;
  unit: string;
  count: number;
}

export interface IFormattedInboundInvoicesData {
  date: number;
  sellCompany: string;
  product: string;
  productType: string;
  unit: string;
  specification: string;
  count: number;
  price: number;
  tax: number;
}
