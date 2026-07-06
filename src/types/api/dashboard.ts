export interface DashboardResponse {
    data: {
        bookings: {
            cards: {
                total_bookings: number,
                confirmed: number,
                cancelled: number,
                pending: number,
                revenue_sar: number,
                paid_sar: number,
                remaining_sar: number
            },
            charts: {
                monthly_trend: {
                    month_num: number,
                    month_name: string,
                    count: number,
                    revenue: number
                }[]
                annual_comparison: {
                    current_year: {
                        year: number,
                        revenue: number
                    },
                    last_year: {
                        year: number,
                        revenue: number
                    },
                    growth_rate: number
                },
                booking_sources: {
                    "source": "Direct" | "hotel",
                    count: number,
                    revenue: number
                }[]
            }
        },
        quotations: {
            cards: {
                total_quotations: number,
                valid: number,
                expired: number,
                converted: number,
                conversion_rate: number
            },
            charts: {
                monthly_trend: {
                    month_num: number,
                    month_name: string,
                    created: number,
                    converted: number,
                    conversion_rate: number
                }[]
                top_requested_hotels: {
                    id: number,
                    name: string,
                    count: number
                }[]
            }
        },
        hotels: {
            cards: {
                total_hotels: number,
                active: number,
                archived: number
            },
            charts: {
                stars_distribution: {
                    stars: number,
                    count: number
                }[]
                country_distribution: {
                    id: number,
                    country_name: string,
                    count: number
                }[]
            }
        },
        rooms: {
            cards: {
                total_rooms: number,
                active: number,
                archived: number
            },
            charts: {
                views_distribution: {
                    view: string,
                    count: number
                }[]
                rooms_per_hotel: {
                    hotel_id: number,
                    hotel_name: string,
                    count: number
                }[]
            }
        },
        customers: {
            cards: {
                total_customers: number,
                active: number,
                corporate: number,
                individual: number
            },
            charts: {
                monthly_registration_trend: {
                    month_num: number,
                    month_name: string,
                    count: number
                }[]
                country_distribution: {
                    id: number,
                    country_name: string,
                    count: number
                }[]
                top_customers_by_revenue: {
                    id: number,
                    name: string,
                    revenue: number
                }[]
            }
        },
        suppliers: {
            cards: {
                total_suppliers: number,
                active: number,
                archived: number
            },
            charts: {
                country_distribution: {
                    id: number,
                    country_name: string,
                    count: number
                }[]
                top_suppliers_by_prices: {
                    id: number,
                    name: string,
                    price_listings_count: number
                }[]
            }
        },
        invoices: {
            cards: {
                total_invoices: number,
                paid: {
                    count: number,
                    amount_sar: number
                },
                overdue: {
                    count: number,
                    amount_sar: number
                },
                scheduled: {
                    count: number,
                    amount_sar: number
                },
                cancelled: {
                    count: number,
                    amount_sar: number
                },
                total_collected_sar: number,
                collection_rate: number
            },
            charts: {
                monthly_collection_trend: {
                    month_num: number,
                    month_name: string,
                    collected: number
                }[]
            }
        },
        tasks: {
            cards: {
                total_tasks: number,
                completed: number,
                in_progress: number,
                pending: number,
                overdue: number
            },
            charts: {
                priority_distribution: {
                    priority: "urgent" | "high" | "medium" | "low",
                    count: number
                }[]
                status_distribution: {
                    status: "open" | "awaiting_reply",
                    count: number
                }[]
                top_assignees: {
                    id: number,
                    name: string,
                    task_count: number
                }[]
            }
        }
    },
    message: string,
    status_code: number

}