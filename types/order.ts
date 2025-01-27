export interface OrderProduct {
    price: number;
    code: string;
}

export interface Order {
    pk: string;
    sk?: string;
    createdAt?: number;
    shipping: {
        type: 'URGENT' | 'ECONOMIC';
        price: number;
        carrier: 'CORREIOS' | 'FEDEX';
    };
    billing: {
        paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';
        totalPrice: number;
    },
    products: OrderProduct[];
}