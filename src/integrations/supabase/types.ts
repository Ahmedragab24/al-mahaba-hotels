export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      approval_requests: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          rejected_at: string | null
          rejected_by: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      approval_thresholds: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          entity_type: string
          id: string
          is_active: boolean
          notes: string | null
          requires_second_approver: boolean
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency: string
          entity_type: string
          id?: string
          is_active?: boolean
          notes?: string | null
          requires_second_approver?: boolean
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          entity_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          requires_second_approver?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_thresholds_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          deleted_at: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          id: string
          mime_type: string
          original_name: string
          storage_path: string
          updated_at: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          id?: string
          mime_type: string
          original_name: string
          storage_path: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number
          id?: string
          mime_type?: string
          original_name?: string
          storage_path?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      booking_guests: {
        Row: {
          booking_id: string
          booking_room_id: string | null
          created_at: string
          email: string | null
          full_name: string
          guest_type: string
          id: string
          is_lead: boolean
          nationality: string | null
          notes: string | null
          passport_no: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          booking_room_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          guest_type?: string
          id?: string
          is_lead?: boolean
          nationality?: string | null
          notes?: string | null
          passport_no?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          booking_room_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          guest_type?: string
          id?: string
          is_lead?: boolean
          nationality?: string | null
          notes?: string | null
          passport_no?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_guests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_guests_booking_room_id_fkey"
            columns: ["booking_room_id"]
            isOneToOne: false
            referencedRelation: "booking_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_rooms: {
        Row: {
          booking_id: string
          check_in: string
          check_out: string
          confirmation_status: string
          cost_price: number | null
          created_at: string
          fees: number
          hotel_id: string
          id: string
          margin: number
          nights: number
          occupancy_type: string
          quotation_item_id: string | null
          rate_id: string | null
          room_confirmed_at: string | null
          room_confirmed_by: string | null
          room_type_id: string | null
          rooms: number
          selling_price: number | null
          supplier_confirmation_no: string | null
          supplier_id: string | null
          taxes: number
          total_cost: number
          total_selling: number
          updated_at: string
        }
        Insert: {
          booking_id: string
          check_in: string
          check_out: string
          confirmation_status?: string
          cost_price?: number | null
          created_at?: string
          fees?: number
          hotel_id: string
          id?: string
          margin?: number
          nights?: number
          occupancy_type: string
          quotation_item_id?: string | null
          rate_id?: string | null
          room_confirmed_at?: string | null
          room_confirmed_by?: string | null
          room_type_id?: string | null
          rooms?: number
          selling_price?: number | null
          supplier_confirmation_no?: string | null
          supplier_id?: string | null
          taxes?: number
          total_cost?: number
          total_selling?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string
          check_in?: string
          check_out?: string
          confirmation_status?: string
          cost_price?: number | null
          created_at?: string
          fees?: number
          hotel_id?: string
          id?: string
          margin?: number
          nights?: number
          occupancy_type?: string
          quotation_item_id?: string | null
          rate_id?: string | null
          room_confirmed_at?: string | null
          room_confirmed_by?: string | null
          room_type_id?: string | null
          rooms?: number
          selling_price?: number | null
          supplier_confirmation_no?: string | null
          supplier_id?: string | null
          taxes?: number
          total_cost?: number
          total_selling?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_rooms_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_rooms_quotation_item_id_fkey"
            columns: ["quotation_item_id"]
            isOneToOne: false
            referencedRelation: "quotation_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_rooms_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "hotel_room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_rooms_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_history: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          reason: string | null
          to_status: string
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          reason?: string | null
          to_status: string
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_no: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          checked_out_at: string | null
          checked_out_by: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          deleted_at: string | null
          id: string
          is_simulated: boolean
          no_show_at: string | null
          no_show_by: string | null
          notes: string | null
          quotation_id: string | null
          special_requests: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_date?: string
          booking_no?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          checked_out_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          deleted_at?: string | null
          id?: string
          is_simulated?: boolean
          no_show_at?: string | null
          no_show_by?: string | null
          notes?: string | null
          quotation_id?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_no?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          checked_out_at?: string | null
          checked_out_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          deleted_at?: string | null
          id?: string
          is_simulated?: boolean
          no_show_at?: string | null
          no_show_by?: string | null
          notes?: string | null
          quotation_id?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: true
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country_code: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
        }
        Insert: {
          country_code: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
        }
        Update: {
          country_code?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      counters: {
        Row: {
          current_value: number
          key: string
          padding: number
          prefix: string
          updated_at: string
        }
        Insert: {
          current_value?: number
          key: string
          padding?: number
          prefix?: string
          updated_at?: string
        }
        Update: {
          current_value?: number
          key?: string
          padding?: number
          prefix?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          is_active: boolean
          name_ar: string
          name_en: string
          phone_code: string | null
        }
        Insert: {
          code: string
          is_active?: boolean
          name_ar: string
          name_en: string
          phone_code?: string | null
        }
        Update: {
          code?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          phone_code?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          is_active: boolean
          name_ar: string
          name_en: string
          symbol: string | null
        }
        Insert: {
          code: string
          is_active?: boolean
          name_ar: string
          name_en: string
          symbol?: string | null
        }
        Update: {
          code?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          symbol?: string | null
        }
        Relationships: []
      }
      customer_adjustments: {
        Row: {
          adjustment_no: string | null
          adjustment_type: string
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          exchange_rate: number
          id: string
          invoice_id: string | null
          reason: string
        }
        Insert: {
          adjustment_no?: string | null
          adjustment_type: string
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          exchange_rate?: number
          id?: string
          invoice_id?: string | null
          reason: string
        }
        Update: {
          adjustment_no?: string | null
          adjustment_type?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          exchange_rate?: number
          id?: string
          invoice_id?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_adjustments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_attachments: {
        Row: {
          category: string | null
          created_at: string
          customer_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          customer_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          customer_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_attachments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_communications: {
        Row: {
          body: string | null
          channel: string
          contact_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          direction: string | null
          id: string
          occurred_at: string
          subject: string | null
        }
        Insert: {
          body?: string | null
          channel: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          direction?: string | null
          id?: string
          occurred_at?: string
          subject?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          direction?: string | null
          id?: string
          occurred_at?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "customer_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_communications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          mobile: string | null
          notes: string | null
          phone: string | null
          preferred_language: Database["public"]["Enums"]["app_language"] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["app_language"]
            | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?:
            | Database["public"]["Enums"]["app_language"]
            | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city_id: string | null
          code: string
          commercial_registration: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          credit_days: number
          credit_limit: number
          customer_type: string
          deleted_at: string | null
          email: string | null
          id: string
          is_simulated: boolean
          legal_name: string | null
          mobile: string | null
          name_ar: string
          name_en: string
          notes: string | null
          parent_customer_id: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          preferred_currency: string | null
          preferred_language: Database["public"]["Enums"]["app_language"]
          rating: number | null
          status: Database["public"]["Enums"]["entity_status"]
          tags: string[] | null
          tax_number: string | null
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city_id?: string | null
          code: string
          commercial_registration?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          credit_days?: number
          credit_limit?: number
          customer_type?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_simulated?: boolean
          legal_name?: string | null
          mobile?: string | null
          name_ar: string
          name_en: string
          notes?: string | null
          parent_customer_id?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_currency?: string | null
          preferred_language?: Database["public"]["Enums"]["app_language"]
          rating?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          tags?: string[] | null
          tax_number?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city_id?: string | null
          code?: string
          commercial_registration?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          credit_days?: number
          credit_limit?: number
          customer_type?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_simulated?: boolean
          legal_name?: string | null
          mobile?: string | null
          name_ar?: string
          name_en?: string
          notes?: string | null
          parent_customer_id?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_currency?: string | null
          preferred_language?: Database["public"]["Enums"]["app_language"]
          rating?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          tags?: string[] | null
          tax_number?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "customers_parent_customer_id_fkey"
            columns: ["parent_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_preferred_currency_fkey"
            columns: ["preferred_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          id: string
          rate: number
          rate_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency: string
          id?: string
          rate: number
          rate_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          rate?: number
          rate_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          category: string | null
          code: string
          icon: string | null
          id: string
          name_ar: string
          name_en: string
        }
        Insert: {
          category?: string | null
          code: string
          icon?: string | null
          id?: string
          name_ar: string
          name_en: string
        }
        Update: {
          category?: string | null
          code?: string
          icon?: string | null
          id?: string
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      hotel_contacts: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          hotel_id: string
          id: string
          is_primary: boolean
          mobile: string | null
          notes: string | null
          phone: string | null
          preferred_language: Database["public"]["Enums"]["app_language"]
          title: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          hotel_id: string
          id?: string
          is_primary?: boolean
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["app_language"]
          title?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          hotel_id?: string
          id?: string
          is_primary?: boolean
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["app_language"]
          title?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_contacts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_facilities: {
        Row: {
          facility_id: string
          hotel_id: string
        }
        Insert: {
          facility_id: string
          hotel_id: string
        }
        Update: {
          facility_id?: string
          hotel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_facilities_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_facilities_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_images: {
        Row: {
          caption: string | null
          created_at: string
          file_path: string
          hotel_id: string
          id: string
          is_cover: boolean
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_path: string
          hotel_id: string
          id?: string
          is_cover?: boolean
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_path?: string
          hotel_id?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotel_images_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_meal_plans: {
        Row: {
          board: Database["public"]["Enums"]["rate_board"]
          description_ar: string | null
          description_en: string | null
          hotel_id: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
        }
        Insert: {
          board: Database["public"]["Enums"]["rate_board"]
          description_ar?: string | null
          description_en?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
        }
        Update: {
          board?: Database["public"]["Enums"]["rate_board"]
          description_ar?: string | null
          description_en?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_meal_plans_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_room_types: {
        Row: {
          bed_type: string | null
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          hotel_id: string
          id: string
          is_active: boolean
          max_adults: number
          max_children: number
          max_occupancy: number
          name_ar: string
          name_en: string
          size_sqm: number | null
          smoking_allowed: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          bed_type?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          max_adults?: number
          max_children?: number
          max_occupancy?: number
          name_ar: string
          name_en: string
          size_sqm?: number | null
          smoking_allowed?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bed_type?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          max_adults?: number
          max_children?: number
          max_occupancy?: number
          name_ar?: string
          name_en?: string
          size_sqm?: number | null
          smoking_allowed?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_room_types_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_suppliers: {
        Row: {
          created_at: string
          hotel_id: string
          id: string
          is_preferred: boolean
          notes: string | null
          supplier_id: string
        }
        Insert: {
          created_at?: string
          hotel_id: string
          id?: string
          is_preferred?: boolean
          notes?: string | null
          supplier_id: string
        }
        Update: {
          created_at?: string
          hotel_id?: string
          id?: string
          is_preferred?: boolean
          notes?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_suppliers_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_taxes: {
        Row: {
          apply_scope: string
          calc_method: string
          code: string
          created_at: string
          created_by: string | null
          currency: string | null
          deleted_at: string | null
          effective_date: string | null
          expiry_date: string | null
          hotel_id: string
          id: string
          is_active: boolean
          is_inclusive: boolean
          name_ar: string
          name_en: string
          notes: string | null
          tax_type: string
          updated_at: string
          value: number
        }
        Insert: {
          apply_scope?: string
          calc_method?: string
          code?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          hotel_id: string
          id?: string
          is_active?: boolean
          is_inclusive?: boolean
          name_ar: string
          name_en: string
          notes?: string | null
          tax_type?: string
          updated_at?: string
          value: number
        }
        Update: {
          apply_scope?: string
          calc_method?: string
          code?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deleted_at?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          hotel_id?: string
          id?: string
          is_active?: boolean
          is_inclusive?: boolean
          name_ar?: string
          name_en?: string
          notes?: string | null
          tax_type?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotel_taxes_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_views: {
        Row: {
          code: string
          hotel_id: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
        }
        Insert: {
          code: string
          hotel_id: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
        }
        Update: {
          code?: string
          hotel_id?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_views_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          brand: string | null
          check_in_time: string | null
          check_out_time: string | null
          city_id: string | null
          code: string
          country_code: string | null
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          district: string | null
          email: string | null
          id: string
          is_direct_supplier: boolean
          latitude: number | null
          longitude: number | null
          name_ar: string
          name_en: string
          phone: string | null
          policies_ar: string | null
          policies_en: string | null
          postal_code: string | null
          star_rating: number | null
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          brand?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city_id?: string | null
          code: string
          country_code?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_direct_supplier?: boolean
          latitude?: number | null
          longitude?: number | null
          name_ar: string
          name_en: string
          phone?: string | null
          policies_ar?: string | null
          policies_en?: string | null
          postal_code?: string | null
          star_rating?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          brand?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          city_id?: string | null
          code?: string
          country_code?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_direct_supplier?: boolean
          latitude?: number | null
          longitude?: number | null
          name_ar?: string
          name_en?: string
          phone?: string | null
          policies_ar?: string | null
          policies_en?: string | null
          postal_code?: string | null
          star_rating?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotels_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      invoice_items: {
        Row: {
          booking_room_id: string | null
          created_at: string
          description_ar: string | null
          description_en: string
          fees: number
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          taxes: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          booking_room_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en: string
          fees?: number
          id?: string
          invoice_id: string
          line_total?: number
          quantity?: number
          taxes?: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          booking_room_id?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string
          fees?: number
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          taxes?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_booking_room_id_fkey"
            columns: ["booking_room_id"]
            isOneToOne: false
            referencedRelation: "booking_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          invoice_id: string
          reason: string | null
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          invoice_id: string
          reason?: string | null
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          invoice_id?: string
          reason?: string | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_status_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          booking_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          deleted_at: string | null
          discount: number
          due_date: string
          exchange_rate: number
          fees: number
          id: string
          invoice_date: string
          invoice_no: string | null
          is_simulated: boolean
          issued_at: string | null
          issued_by: string | null
          notes: string | null
          paid_amount: number
          status: string
          subtotal: number
          taxes: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          deleted_at?: string | null
          discount?: number
          due_date?: string
          exchange_rate?: number
          fees?: number
          id?: string
          invoice_date?: string
          invoice_no?: string | null
          is_simulated?: boolean
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          paid_amount?: number
          status?: string
          subtotal?: number
          taxes?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          deleted_at?: string | null
          discount?: number
          due_date?: string
          exchange_rate?: number
          fees?: number
          id?: string
          invoice_date?: string
          invoice_no?: string | null
          is_simulated?: boolean
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          paid_amount?: number
          status?: string
          subtotal?: number
          taxes?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          amount: number
          created_at: string
          id: string
          payable_id: string
          payment_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payable_id: string
          payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payable_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_payable_id_fkey"
            columns: ["payable_id"]
            isOneToOne: false
            referencedRelation: "supplier_payables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "supplier_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_order_items: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payable_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          payable_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_order_items_payable_id_fkey"
            columns: ["payable_id"]
            isOneToOne: false
            referencedRelation: "supplier_payables"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string
          deleted_at: string | null
          exchange_rate: number
          id: string
          notes: string | null
          order_no: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          requested_by: string | null
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          exchange_rate?: number
          id?: string
          notes?: string | null
          order_no?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          status?: string
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string
          deleted_at?: string | null
          exchange_rate?: number
          id?: string
          notes?: string | null
          order_no?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          email: string
          failed_login_attempts: number
          full_name_ar: string | null
          full_name_en: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          last_login_ip: string | null
          locked_until: string | null
          must_change_password: boolean
          password_changed_at: string | null
          phone: string | null
          preferred_language: Database["public"]["Enums"]["app_language"]
          supplier_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          failed_login_attempts?: number
          full_name_ar?: string | null
          full_name_en?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          last_login_ip?: string | null
          locked_until?: string | null
          must_change_password?: boolean
          password_changed_at?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["app_language"]
          supplier_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          failed_login_attempts?: number
          full_name_ar?: string | null
          full_name_en?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          last_login_ip?: string | null
          locked_until?: string | null
          must_change_password?: boolean
          password_changed_at?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["app_language"]
          supplier_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          check_in: string
          check_out: string
          cost_price: number | null
          created_at: string
          fees: number
          hotel_id: string
          id: string
          margin: number
          nights: number
          occupancy_type: string
          quotation_id: string
          rate_id: string | null
          rfq_response_id: string | null
          room_type_id: string | null
          rooms: number
          selling_price: number | null
          taxes: number
          total_cost: number
          total_selling: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          cost_price?: number | null
          created_at?: string
          fees?: number
          hotel_id: string
          id?: string
          margin?: number
          nights?: number
          occupancy_type: string
          quotation_id: string
          rate_id?: string | null
          rfq_response_id?: string | null
          room_type_id?: string | null
          rooms?: number
          selling_price?: number | null
          taxes?: number
          total_cost?: number
          total_selling?: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          cost_price?: number | null
          created_at?: string
          fees?: number
          hotel_id?: string
          id?: string
          margin?: number
          nights?: number
          occupancy_type?: string
          quotation_id?: string
          rate_id?: string | null
          rfq_response_id?: string | null
          room_type_id?: string | null
          rooms?: number
          selling_price?: number | null
          taxes?: number
          total_cost?: number
          total_selling?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_rfq_response_id_fkey"
            columns: ["rfq_response_id"]
            isOneToOne: false
            referencedRelation: "rfq_supplier_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "hotel_room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          deleted_at: string | null
          expiry_date: string
          id: string
          is_simulated: boolean
          notes: string | null
          quotation_date: string
          quotation_no: string
          status: string
          travel_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          deleted_at?: string | null
          expiry_date: string
          id?: string
          is_simulated?: boolean
          notes?: string | null
          quotation_date?: string
          quotation_no?: string
          status?: string
          travel_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          deleted_at?: string | null
          expiry_date?: string
          id?: string
          is_simulated?: boolean
          notes?: string | null
          quotation_date?: string
          quotation_no?: string
          status?: string
          travel_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_approvals: {
        Row: {
          action: string
          comments: string | null
          created_at: string
          id: string
          performed_by: string | null
          rate_id: string
        }
        Insert: {
          action: string
          comments?: string | null
          created_at?: string
          id?: string
          performed_by?: string | null
          rate_id: string
        }
        Update: {
          action?: string
          comments?: string | null
          created_at?: string
          id?: string
          performed_by?: string | null
          rate_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_approvals_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "rates"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cancellation_rules: {
        Row: {
          days_before_checkin: number
          id: string
          notes: string | null
          penalty_type: string
          penalty_value: number
          rate_id: string
        }
        Insert: {
          days_before_checkin: number
          id?: string
          notes?: string | null
          penalty_type: string
          penalty_value?: number
          rate_id: string
        }
        Update: {
          days_before_checkin?: number
          id?: string
          notes?: string | null
          penalty_type?: string
          penalty_value?: number
          rate_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_cancellation_rules_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "rates"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_occupancy_prices: {
        Row: {
          active: boolean
          cost_price: number
          created_at: string
          currency: string | null
          id: string
          markup_percent: number | null
          occupancy_type: string
          rate_id: string
          selling_price: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          cost_price: number
          created_at?: string
          currency?: string | null
          id?: string
          markup_percent?: number | null
          occupancy_type: string
          rate_id: string
          selling_price?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          cost_price?: number
          created_at?: string
          currency?: string | null
          id?: string
          markup_percent?: number | null
          occupancy_type?: string
          rate_id?: string
          selling_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_occupancy_prices_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "rates"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_seasons: {
        Row: {
          cost_per_night: number
          end_date: string
          id: string
          min_nights: number
          name: string
          notes: string | null
          rate_id: string
          selling_price: number | null
          start_date: string
        }
        Insert: {
          cost_per_night: number
          end_date: string
          id?: string
          min_nights?: number
          name: string
          notes?: string | null
          rate_id: string
          selling_price?: number | null
          start_date: string
        }
        Update: {
          cost_per_night?: number
          end_date?: string
          id?: string
          min_nights?: number
          name?: string
          notes?: string | null
          rate_id?: string
          selling_price?: number | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_seasons_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "rates"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_taxes: {
        Row: {
          applies_to: string
          id: string
          is_inclusive: boolean
          name: string
          rate_id: string
          tax_type: string
          value: number
        }
        Insert: {
          applies_to?: string
          id?: string
          is_inclusive?: boolean
          name: string
          rate_id: string
          tax_type: string
          value: number
        }
        Update: {
          applies_to?: string
          id?: string
          is_inclusive?: boolean
          name?: string
          rate_id?: string
          tax_type?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "rate_taxes_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "rates"
            referencedColumns: ["id"]
          },
        ]
      }
      rates: {
        Row: {
          allotment: number | null
          approved_at: string | null
          approved_by: string | null
          cancellation_policy_ar: string | null
          cancellation_policy_en: string | null
          code: string
          contract_id: string | null
          cost_per_night: number
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          hotel_id: string
          id: string
          is_direct: boolean
          is_simulated: boolean
          markup_pct: number | null
          max_nights: number | null
          meal_plan: Database["public"]["Enums"]["rate_board"]
          min_nights: number
          notes_ar: string | null
          notes_en: string | null
          parent_rate_id: string | null
          rejection_reason: string | null
          release_days: number
          room_type_id: string
          selling_price: number | null
          status: Database["public"]["Enums"]["approval_status"]
          submitted_at: string | null
          submitted_by: string | null
          superseded_at: string | null
          superseded_by: string | null
          supplier_id: string | null
          updated_at: string
          updated_by: string | null
          valid_from: string
          valid_to: string
          version: number
          view_id: string | null
        }
        Insert: {
          allotment?: number | null
          approved_at?: string | null
          approved_by?: string | null
          cancellation_policy_ar?: string | null
          cancellation_policy_en?: string | null
          code: string
          contract_id?: string | null
          cost_per_night: number
          created_at?: string
          created_by?: string | null
          currency: string
          deleted_at?: string | null
          hotel_id: string
          id?: string
          is_direct?: boolean
          is_simulated?: boolean
          markup_pct?: number | null
          max_nights?: number | null
          meal_plan: Database["public"]["Enums"]["rate_board"]
          min_nights?: number
          notes_ar?: string | null
          notes_en?: string | null
          parent_rate_id?: string | null
          rejection_reason?: string | null
          release_days?: number
          room_type_id: string
          selling_price?: number | null
          status?: Database["public"]["Enums"]["approval_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          superseded_at?: string | null
          superseded_by?: string | null
          supplier_id?: string | null
          updated_at?: string
          updated_by?: string | null
          valid_from: string
          valid_to: string
          version?: number
          view_id?: string | null
        }
        Update: {
          allotment?: number | null
          approved_at?: string | null
          approved_by?: string | null
          cancellation_policy_ar?: string | null
          cancellation_policy_en?: string | null
          code?: string
          contract_id?: string | null
          cost_per_night?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          hotel_id?: string
          id?: string
          is_direct?: boolean
          is_simulated?: boolean
          markup_pct?: number | null
          max_nights?: number | null
          meal_plan?: Database["public"]["Enums"]["rate_board"]
          min_nights?: number
          notes_ar?: string | null
          notes_en?: string | null
          parent_rate_id?: string | null
          rejection_reason?: string | null
          release_days?: number
          room_type_id?: string
          selling_price?: number | null
          status?: Database["public"]["Enums"]["approval_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          superseded_at?: string | null
          superseded_by?: string | null
          supplier_id?: string | null
          updated_at?: string
          updated_by?: string | null
          valid_from?: string
          valid_to?: string
          version?: number
          view_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rates_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "supplier_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rates_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "rates_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rates_parent_rate_id_fkey"
            columns: ["parent_rate_id"]
            isOneToOne: false
            referencedRelation: "rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rates_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "hotel_room_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rates_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rates_view_id_fkey"
            columns: ["view_id"]
            isOneToOne: false
            referencedRelation: "hotel_views"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_allocations: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          receipt_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          receipt_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          receipt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_allocations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_allocations_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          allocated_amount: number
          amount: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          deleted_at: string | null
          exchange_rate: number
          id: string
          is_simulated: boolean
          notes: string | null
          payment_method: string
          receipt_date: string
          receipt_no: string | null
          reference_no: string | null
          status: string
          updated_at: string
        }
        Insert: {
          allocated_amount?: number
          amount: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          deleted_at?: string | null
          exchange_rate?: number
          id?: string
          is_simulated?: boolean
          notes?: string | null
          payment_method?: string
          receipt_date?: string
          receipt_no?: string | null
          reference_no?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          deleted_at?: string | null
          exchange_rate?: number
          id?: string
          is_simulated?: boolean
          notes?: string | null
          payment_method?: string
          receipt_date?: string
          receipt_no?: string | null
          reference_no?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          export_format: string
          frequency: string
          id: string
          last_run_at: string | null
          next_run_at: string | null
          recipients: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          export_format?: string
          frequency: string
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          export_format?: string
          frequency?: string
          id?: string
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_shared: boolean
          name_ar: string
          name_en: string
          report_key: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_shared?: boolean
          name_ar: string
          name_en: string
          report_key: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_shared?: boolean
          name_ar?: string
          name_en?: string
          report_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      rfq_items: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          hotel_id: string
          id: string
          meal_plan: string | null
          nights: number
          occupancy_type: string
          quantity: number
          rfq_id: string
          room_type_id: string | null
          special_requests: string | null
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          hotel_id: string
          id?: string
          meal_plan?: string | null
          nights?: number
          occupancy_type: string
          quantity?: number
          rfq_id: string
          room_type_id?: string | null
          special_requests?: string | null
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          hotel_id?: string
          id?: string
          meal_plan?: string | null
          nights?: number
          occupancy_type?: string
          quantity?: number
          rfq_id?: string
          room_type_id?: string | null
          special_requests?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_items_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_items_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_items_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "hotel_room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_status: string | null
          id: string
          notes: string | null
          rfq_id: string
          to_status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_status?: string | null
          id?: string
          notes?: string | null
          rfq_id: string
          to_status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_status?: string | null
          id?: string
          notes?: string | null
          rfq_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_status_history_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_supplier_requests: {
        Row: {
          created_at: string
          id: string
          response_due_date: string | null
          rfq_id: string
          sent_at: string | null
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          response_due_date?: string | null
          rfq_id: string
          sent_at?: string | null
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          response_due_date?: string | null
          rfq_id?: string
          sent_at?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_supplier_requests_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_supplier_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_supplier_responses: {
        Row: {
          availability: string
          available_rooms: number | null
          cancellation_policy: string | null
          cost_price: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          id: string
          release_days: number | null
          remarks: string | null
          request_id: string
          responded_at: string
          rfq_id: string
          rfq_item_id: string
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          availability?: string
          available_rooms?: number | null
          cancellation_policy?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          release_days?: number | null
          remarks?: string | null
          request_id: string
          responded_at?: string
          rfq_id: string
          rfq_item_id: string
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          availability?: string
          available_rooms?: number | null
          cancellation_policy?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          release_days?: number | null
          remarks?: string | null
          request_id?: string
          responded_at?: string
          rfq_id?: string
          rfq_item_id?: string
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_supplier_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "rfq_supplier_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_supplier_responses_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_supplier_responses_rfq_item_id_fkey"
            columns: ["rfq_item_id"]
            isOneToOne: false
            referencedRelation: "rfq_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_supplier_responses_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          deleted_at: string | null
          destination: string | null
          id: string
          is_simulated: boolean
          notes: string | null
          rfq_no: string | null
          status: string
          travel_end: string
          travel_start: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          deleted_at?: string | null
          destination?: string | null
          id?: string
          is_simulated?: boolean
          notes?: string | null
          rfq_no?: string | null
          status?: string
          travel_end: string
          travel_start: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          deleted_at?: string | null
          destination?: string | null
          id?: string
          is_simulated?: boolean
          notes?: string | null
          rfq_no?: string | null
          status?: string
          travel_end?: string
          travel_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          end_date: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          notes: string | null
          season_type: string
          start_date: string
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          notes?: string | null
          season_type?: string
          start_date: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          notes?: string | null
          season_type?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      simulation_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          intensity: string
          interval_minutes: number
          last_run_at: string | null
          last_run_status: string | null
          last_run_summary: Json | null
          total_runs: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          intensity?: string
          interval_minutes?: number
          last_run_at?: string | null
          last_run_status?: string | null
          last_run_summary?: Json | null
          total_runs?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          intensity?: string
          interval_minutes?: number
          last_run_at?: string | null
          last_run_status?: string | null
          last_run_summary?: Json | null
          total_runs?: number
          updated_at?: string
        }
        Relationships: []
      }
      supplier_applications: {
        Row: {
          address_line1: string | null
          admin_notes: string | null
          city_id: string | null
          commercial_reg_path: string | null
          commercial_registration: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          contact_position: string | null
          country_code: string | null
          created_at: string
          created_supplier_id: string | null
          created_user_id: string | null
          id: string
          legal_name: string | null
          name_ar: string
          name_en: string
          profile_path: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          supplier_type: string
          tax_cert_path: string | null
          tax_number: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          admin_notes?: string | null
          city_id?: string | null
          commercial_reg_path?: string | null
          commercial_registration?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          contact_position?: string | null
          country_code?: string | null
          created_at?: string
          created_supplier_id?: string | null
          created_user_id?: string | null
          id?: string
          legal_name?: string | null
          name_ar: string
          name_en: string
          profile_path?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          supplier_type: string
          tax_cert_path?: string | null
          tax_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          admin_notes?: string | null
          city_id?: string | null
          commercial_reg_path?: string | null
          commercial_registration?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          contact_position?: string | null
          country_code?: string | null
          created_at?: string
          created_supplier_id?: string | null
          created_user_id?: string | null
          id?: string
          legal_name?: string | null
          name_ar?: string
          name_en?: string
          profile_path?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          supplier_type?: string
          tax_cert_path?: string | null
          tax_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_applications_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_applications_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "supplier_applications_created_supplier_id_fkey"
            columns: ["created_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_bank_accounts: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          branch: string | null
          country_code: string | null
          created_at: string
          currency: string | null
          iban: string | null
          id: string
          is_default: boolean
          notes: string | null
          supplier_id: string
          swift: string | null
          updated_at: string
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_name: string
          branch?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string | null
          iban?: string | null
          id?: string
          is_default?: boolean
          notes?: string | null
          supplier_id: string
          swift?: string | null
          updated_at?: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          branch?: string | null
          country_code?: string | null
          created_at?: string
          currency?: string | null
          iban?: string | null
          id?: string
          is_default?: boolean
          notes?: string | null
          supplier_id?: string
          swift?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_bank_accounts_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "supplier_bank_accounts_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "supplier_bank_accounts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_contacts: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          mobile: string | null
          notes: string | null
          phone: string | null
          supplier_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          supplier_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          supplier_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_contacts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_contracts: {
        Row: {
          cancellation_terms: string | null
          commission_pct: number | null
          commission_type: string
          contract_number: string
          contract_type: string
          created_at: string
          created_by: string | null
          credit_days: number
          currency: string | null
          deleted_at: string | null
          end_date: string
          file_path: string | null
          hotel_id: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          supplier_id: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cancellation_terms?: string | null
          commission_pct?: number | null
          commission_type?: string
          contract_number: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          credit_days?: number
          currency?: string | null
          deleted_at?: string | null
          end_date: string
          file_path?: string | null
          hotel_id?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          supplier_id: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cancellation_terms?: string | null
          commission_pct?: number | null
          commission_type?: string
          contract_number?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          credit_days?: number
          currency?: string | null
          deleted_at?: string | null
          end_date?: string
          file_path?: string | null
          hotel_id?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          supplier_id?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_contracts_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "supplier_contracts_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_contracts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payables: {
        Row: {
          amount: number
          booking_id: string | null
          booking_room_id: string | null
          cancellation_reason: string | null
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          due_date: string | null
          exchange_rate: number
          id: string
          notes: string | null
          paid_amount: number
          payable_no: string | null
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          booking_room_id?: string | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          due_date?: string | null
          exchange_rate?: number
          id?: string
          notes?: string | null
          paid_amount?: number
          payable_no?: string | null
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          booking_room_id?: string | null
          cancellation_reason?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          due_date?: string | null
          exchange_rate?: number
          id?: string
          notes?: string | null
          paid_amount?: number
          payable_no?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payables_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payables_booking_room_id_fkey"
            columns: ["booking_room_id"]
            isOneToOne: true
            referencedRelation: "booking_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payables_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          exchange_rate: number
          id: string
          is_simulated: boolean
          notes: string | null
          payment_date: string
          payment_method: string
          payment_no: string | null
          payment_order_id: string
          reference_no: string | null
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          exchange_rate?: number
          id?: string
          is_simulated?: boolean
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_no?: string | null
          payment_order_id: string
          reference_no?: string | null
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          exchange_rate?: number
          id?: string
          is_simulated?: boolean
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_no?: string | null
          payment_order_id?: string
          reference_no?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_payment_order_id_fkey"
            columns: ["payment_order_id"]
            isOneToOne: false
            referencedRelation: "payment_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_ratings: {
        Row: {
          category: string | null
          comment: string | null
          created_at: string
          id: string
          rated_by: string | null
          score: number
          supplier_id: string
        }
        Insert: {
          category?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rated_by?: string | null
          score: number
          supplier_id: string
        }
        Update: {
          category?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rated_by?: string | null
          score?: number
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_ratings_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city_id: string | null
          code: string
          commercial_registration: string | null
          country_code: string | null
          created_at: string
          created_by: string | null
          credit_days: number
          deleted_at: string | null
          email: string | null
          id: string
          is_simulated: boolean
          legal_name: string | null
          mobile: string | null
          name_ar: string
          name_en: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          preferred_currency: string | null
          rating: number | null
          status: Database["public"]["Enums"]["entity_status"]
          supplier_type: string
          tags: string[] | null
          tax_number: string | null
          updated_at: string
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city_id?: string | null
          code: string
          commercial_registration?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          credit_days?: number
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_simulated?: boolean
          legal_name?: string | null
          mobile?: string | null
          name_ar: string
          name_en: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          preferred_currency?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          supplier_type?: string
          tags?: string[] | null
          tax_number?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city_id?: string | null
          code?: string
          commercial_registration?: string | null
          country_code?: string | null
          created_at?: string
          created_by?: string | null
          credit_days?: number
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_simulated?: boolean
          legal_name?: string | null
          mobile?: string | null
          name_ar?: string
          name_en?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          preferred_currency?: string | null
          rating?: number | null
          status?: Database["public"]["Enums"]["entity_status"]
          supplier_type?: string
          tags?: string[] | null
          tax_number?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "suppliers_preferred_currency_fkey"
            columns: ["preferred_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_module_blocks: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          module_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          module_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          module_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_rates: { Args: never; Returns: number }
      check_account_lock: { Args: { _email: string }; Returns: Json }
      create_booking_from_quotation: {
        Args: { _quotation_id: string }
        Returns: string
      }
      create_invoice_from_booking: {
        Args: { _booking_id: string }
        Returns: string
      }
      create_payables_from_booking: {
        Args: { _booking_id: string }
        Returns: number
      }
      create_rate_version: {
        Args: { _changes: Json; _rate_id: string }
        Returns: string
      }
      current_user_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      current_user_supplier_id: { Args: never; Returns: string }
      finalize_supplier_application: {
        Args: { _app_id: string; _user_id: string }
        Returns: Json
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_supplier_user: { Args: { _uid: string }; Returns: boolean }
      log_audit: {
        Args: {
          _action: string
          _entity_id: string
          _entity_type: string
          _metadata?: Json
          _new?: Json
          _old?: Json
        }
        Returns: string
      }
      next_code: { Args: { _key: string }; Returns: string }
      record_failed_login: {
        Args: { _email: string; _ip?: string }
        Returns: Json
      }
      record_successful_login: {
        Args: { _ip?: string; _user_id: string }
        Returns: undefined
      }
      reject_supplier_application: {
        Args: { _app_id: string; _reason: string }
        Returns: undefined
      }
    }
    Enums: {
      app_language: "ar" | "en" | "id" | "ur"
      app_role:
        | "super_admin"
        | "admin"
        | "sales_manager"
        | "sales_agent"
        | "operations_manager"
        | "operations_agent"
        | "finance_manager"
        | "finance_agent"
        | "viewer"
        | "supplier"
      approval_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "expired"
      contract_status:
        | "draft"
        | "active"
        | "expired"
        | "terminated"
        | "suspended"
        | "closed"
      entity_status: "active" | "inactive" | "archived"
      rate_board: "RO" | "BB" | "HB" | "FB" | "AI" | "UAI"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_language: ["ar", "en", "id", "ur"],
      app_role: [
        "super_admin",
        "admin",
        "sales_manager",
        "sales_agent",
        "operations_manager",
        "operations_agent",
        "finance_manager",
        "finance_agent",
        "viewer",
        "supplier",
      ],
      approval_status: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "expired",
      ],
      contract_status: [
        "draft",
        "active",
        "expired",
        "terminated",
        "suspended",
        "closed",
      ],
      entity_status: ["active", "inactive", "archived"],
      rate_board: ["RO", "BB", "HB", "FB", "AI", "UAI"],
    },
  },
} as const
