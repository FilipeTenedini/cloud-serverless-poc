export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    CASH = 'CASH'
}

export enum ShippingType {
    URGENT = 'URGENT',
    ECONOMIC = 'ECONOMIC'
}

export enum CarrierType {
    CORREIOS = 'CORREIOS',
    FEDEX = 'FEDEX'
}

export interface OrderRequest {
    email: string,
    productIds: string[],
    payment: PaymentMethod,
    shipping: OrderShipping
}

export interface OrderBilling {
    paymentMethod: PaymentMethod,
    totalPrice: number
}

export interface OrderShipping {
    type: ShippingType,
    carrier: CarrierType
}

export interface OrderResponse {
    email: string,
    id: string,
    createdAt: number,
    billing: OrderBilling,
    shipping: OrderShipping,
    products: OrderProduct[]
}
//
//
//
// \/ interfaces da base de dados
export interface OrderProduct {
    price: number;
    code: string;
}

export interface Order {
    pk: string;
    sk?: string;
    createdAt?: number;
    shipping: OrderShipping;
    billing: OrderBilling;
    products: OrderProduct[];
}
