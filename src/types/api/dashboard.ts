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
                remaining_sar: number,
                average_booking_value_sar: number,
                completion_rate: number,
                total_rooms_booked: number,
                average_stay_duration_nights: number
            },
            charts: {
                monthly_trend: {
                    month_num: number,
                    month_name: string,
                    count: number,
                    revenue: number
                }[],
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
                    source: "hotel" | "Direct" | string,
                    count: number,
                    revenue: number
                }[]
                meal_plans_distribution: {
                    plan: string,
                    plan_text: string
                    count: number,

                }[],
                monthly_nights_trend: {
                    month_num: number,
                    month_name: string,
                    avg_nights: number
                }[]
            }
        },
        quotations: {
            cards: {
                total_quotations: number,
                draft: number,
                approved: number,
                expired: number,
                converted: number,
                conversion_rate: number,
                average_quotation_value_sar: number,
                lost_quotations_count: number,
                total_quoted_rooms: number,
                avg_conversion_days: number
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
                status_distribution: {
                    status: string,
                    status_text: string,
                    count: number,
                    value_sar: number
                }[]
            }
        },
        hotels: {
            cards: {
                total_hotels: number,
                active: number,
                archived: number,
                average_hotel_rating: number,
                hotels_with_bookings_count: number
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
                city_distribution: {
                    id: number,
                    city_name: string,
                    count: number
                }[]
                top_performing_hotels_revenue: {
                    id: number,
                    name: string,
                    revenue_sar: number
                }[]
            }
        },
        rooms: {
            cards: {
                total_rooms: number,
                active: number,
                archived: number,
                average_room_price_sar: number,
                room_types_count: number
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
                room_type_distribution: {
                    id: number,
                    name: string,
                    count: number
                }[]
            }
        },
        customers: {
            cards: {
                total_customers: number,
                active: number,
                corporate: number,
                individual: number,
                returning_customers: number,
                average_lifetime_value_sar: number
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
                booking_frequency: {
                    range: string,
                    count: number
                }[]
            }
        },
        suppliers: {
            cards: {
                total_suppliers: number,
                active: number,
                archived: number,
                average_rating: number,
                active_ratio: number
            },
            charts: {
                country_distribution: {
                    id: number,
                    country_name: string,
                    count: number
                }[],
                top_suppliers_by_prices: {
                    id: number,
                    name: string,
                    avg_price: number
                }[],
                top_suppliers_by_revenue: {
                    id: number,
                    name: string,
                    revenue: number
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
                collection_rate: number,
                average_invoice_value_sar: number,
                average_payment_amount_sar: number,
                unpaid_ratio: number
            },
            charts: {
                monthly_collection_trend: {
                    month_num: number,
                    month_name: string,
                    collected: number
                }[]
                invoice_status_distribution: {
                    status: "paid" | "overdue" | "scheduled" | "cancelled",
                    status_text: string,
                    count: number,
                    amount_sar: number
                }[]
                payment_methods_distribution: {
                    method: string,
                    method_text: string,
                    count: number,
                    sum_sar: number
                }[]
            }
        },
        tasks: {
            cards: {
                total_tasks: number,
                completed: number,
                in_progress: number,
                pending: number,
                overdue: number,
                completion_rate: number,
                average_duration_days: number
            },
            charts: {
                priority_distribution: {
                    priority: string,
                    count: number
                }[],
                status_distribution: {
                    status: string,
                    status_text: string,
                    count: number
                }[],
                top_assignees: {
                    user_id: number,
                    name: string,
                    task_count: number
                }[],
                overdue_by_priority: {
                    priority: string,
                    count: number
                }[]
            }
        }
    },
    message: string,
    status_code: number

}