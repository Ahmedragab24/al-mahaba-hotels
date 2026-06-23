-- SQL Migration to update existing hotel meal plans to match new naming convention

UPDATE public.hotel_meal_plans
SET name_ar = 'Half Board'
WHERE board = 'HB';

UPDATE public.hotel_meal_plans
SET name_ar = 'Full Board'
WHERE board = 'FB';
