export interface HomeResponse {
    data: {
        cards: {
            total_bookings: {
                value: number,
                change_percentage: number
            },
            total_quotations: {
                value: number,
                change_percentage: number
            },
            confirmed_bookings: {
                value: number,
                change_percentage: number
            },
            cancelled_bookings: {
                value: number,
                change_percentage: number
            },
            total_suppliers: {
                value: number,
                change_percentage: number
            },
            active_suppliers: {
                value: number,
                change_percentage: number
            },
            active_hotels: {
                value: number,
                change_percentage: number
            },
            total_rooms: {
                value: number,
                change_percentage: number
            },
            total_customers: {
                value: number,
                change_percentage: number
            },
            receivables_sar: {
                value: number,
                change_percentage: number
            },
            payments_sar: {
                value: number,
                change_percentage: number
            },
            net_profit_sar: {
                value: number,
                change_percentage: number
            }
        },
        charts: {
            annual_financial_performance: {
                month_num: number,
                month_name: string,
                bookings_revenue: number,
                other_income: number,
                expenses: number,
                net_profit: number
            }[],
            bookings_status_distribution: {
                status: "confirmed" | "pending" | "cancelled",
                label: "مؤكد" | "قيد الانتظار" | "ملغي",
                count: number
            }[],
            weekly_bookings_trend: {
                week_label: string,
                count: number
            }[]
        }
    },
    message: string,
    status_code: number
}