export interface Product {
    // lembrando que no dynamo db não podemos usar algumas palavras reservadas como name ou url
    id: string;
    productName: string;
    price: number;
    code: string;
    model: string;
    productUrl: string;
}

export enum ProductEventType {
    CREATED = 'PRODUCT_CREATED',
    UPDATED = 'PRODUCT_UPDATED',
    DELETED = 'PRODUCT_DELETED'
}

export interface ProductEvent {
    requestId: string;
    eventType: ProductEventType;
    product: Product;
    email: string;
}