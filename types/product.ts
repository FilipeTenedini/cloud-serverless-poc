export interface Product {
    // lembrando que no dynamo db não podemos usar algumas palavras reservadas como name ou url
    id: string;
    productName: string;
    price: number;
    code: string;
    model: string;
    productUrl: string;
}
