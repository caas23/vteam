interface Payment {
    trip_id: string;
    cost: string;
    paid: boolean;
    date: Date;
    method: string;
}
  
interface Payments {
    trips: Payment[];
}

interface TableRowProps {
    row: { category: string; count: number; data: Payment[] };
    rowIndex: number;
    selectedRow: number | null;
    toggleDetails: (index: number) => void;
}
  
export type {
    Payment,
    Payments,
    TableRowProps
};
