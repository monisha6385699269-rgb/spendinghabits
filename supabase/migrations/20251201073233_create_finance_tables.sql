/*
  # Personal Finance Management Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name (e.g., Food, Transport, Entertainment)
      - `icon` (text) - Icon identifier for UI
      - `color` (text) - Color code for visual identification
      - `created_at` (timestamptz)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `category_id` (uuid, foreign key to categories)
      - `amount` (decimal) - Expense amount
      - `description` (text) - Expense description
      - `date` (date) - Date of expense
      - `created_at` (timestamptz)
    
    - `savings_targets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `month` (date) - Target month
      - `target_amount` (decimal) - Monthly savings goal
      - `actual_amount` (decimal, default 0) - Actual savings achieved
      - `created_at` (timestamptz)
      - Unique constraint on (user_id, month)

  2. Security
    - Enable RLS on all tables
    - Categories table: Public read access, no user-specific policies needed
    - Expenses table: Users can only manage their own expenses
    - Savings targets table: Users can only manage their own targets
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  amount decimal(10, 2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS savings_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month date NOT NULL,
  target_amount decimal(10, 2) NOT NULL CHECK (target_amount >= 0),
  actual_amount decimal(10, 2) DEFAULT 0 CHECK (actual_amount >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE savings_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings targets"
  ON savings_targets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings targets"
  ON savings_targets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings targets"
  ON savings_targets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings targets"
  ON savings_targets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

INSERT INTO categories (name, icon, color) VALUES
  ('Food & Dining', 'utensils', '#10b981'),
  ('Transportation', 'car', '#3b82f6'),
  ('Shopping', 'shopping-bag', '#ec4899'),
  ('Entertainment', 'tv', '#8b5cf6'),
  ('Bills & Utilities', 'receipt', '#f59e0b'),
  ('Healthcare', 'heart-pulse', '#ef4444'),
  ('Education', 'graduation-cap', '#06b6d4'),
  ('Personal Care', 'sparkles', '#a855f7'),
  ('Travel', 'plane', '#14b8a6'),
  ('Other', 'more-horizontal', '#6b7280')
ON CONFLICT (name) DO NOTHING;