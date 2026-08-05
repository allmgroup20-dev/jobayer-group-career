-- C5: a given gateway transaction may only ever grant once.
-- Partial unique indexes allow multiple NULLs (pending orders have no transaction_id).
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_transaction_id ON orders(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_resource_purchases_transaction_id ON resource_purchases(transaction_id) WHERE transaction_id IS NOT NULL;
