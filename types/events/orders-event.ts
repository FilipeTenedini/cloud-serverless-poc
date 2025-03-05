import { OrderBilling, OrderShipping } from 'types/order';

export enum OrderEventType {
    CREATED = 'ORDER_CREATED',
    DELETED = 'ORDER_DELETED'
}

export interface Envelope {
    eventType: OrderEventType;
    data: string;
}

export interface OrderEvent {
    email: string;
    orderId: string;
    shipping: OrderShipping;
    billing: OrderBilling;
    productCodes: string[];
    requestId: string;
}