export interface InvoiceItem {
    description: string;
    quantity: number;
    rate: number;
}

export interface InvoiceDetails {
    clientName: string;
    amount: string;
    items: Array<InvoiceItem>;
    notes: string;
}

export interface Message {
    sender: "user" | "ai";
    text: string;
}

export interface Template {
    id: string;
    name: string;
}