export interface ICalculationForm {
  currentIncrease?: number;
  currentAuth?: number;
  paidTax?: number;
  realProfitTotal?: number;
  freight?: number;
  office?: number;
  travel?: number;
  business?: number;
  commission?: number;
  interest?: number;
  cumulativeSales?: number;
  paidVat?: number;
  electricityNumber?: number;
  electricityCost?: number;
  electricityTax?: number;
}

export interface IInitCalculationForm extends ICalculationForm {
  realProfitTotalBase?: number;
  cumulativeSalesBase?: number;
  paidVatBase?: number;
}