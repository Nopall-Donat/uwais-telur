-- Aktifkan foreign key constraints di SQLite
PRAGMA foreign_keys = ON;

-- ===========================================================================
-- TABLE: customers (Data pelanggan)
-- ===========================================================================
CREATE TABLE customers (
    customer_id VARCHAR(10) PRIMARY KEY NOT NULL UNIQUE,  -- e.g., P001
    name TEXT NOT NULL DEFAULT 'Customer',
    phone_number VARCHAR(15) DEFAULT '-',
    address TEXT
);

-- ===========================================================================
-- TABLE: suppliers (Data pemasok)
-- ===========================================================================
CREATE TABLE suppliers (
    supplier_id VARCHAR(10) PRIMARY KEY NOT NULL UNIQUE,  -- e.g., S001
    name TEXT NOT NULL,
    phone_number VARCHAR(15) DEFAULT '-',
    address TEXT
);

-- ===========================================================================
-- TABLE: admins (Data admin sistem)
-- ===========================================================================
CREATE TABLE admins (
    admin_id VARCHAR(10) PRIMARY KEY NOT NULL UNIQUE,
    admin_name TEXT NOT NULL,
    password TEXT NOT NULL  -- Sebaiknya simpan hash password
);

-- ===========================================================================
-- TABLE: items (Data item)
-- Catatan: Untuk item yang sama dari supplier berbeda, gunakan item_code yang berbeda.
-- ===========================================================================
CREATE TABLE items (
    item_code VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    item_type TEXT NOT NULL,
    supplier_id VARCHAR(10) NOT NULL,
    stock_quantity INTEGER,
    purchase_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    unit TEXT,
    updated_at TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- ===========================================================================
-- TABLE: sales_transactions (Header transaksi penjualan)
-- ===========================================================================
CREATE TABLE sales_transactions (
    sales_transaction_id VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    admin_id VARCHAR(10) NOT NULL,
    customer_id VARCHAR(10) NOT NULL,
    total_amount DECIMAL(10,2),
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Waktu transaksi dibuat
    updated_at TIMESTAMP,
    status TEXT,  -- Contoh: 'pending', 'completed', 'canceled'
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- ===========================================================================
-- TABLE: sales_orders (Detail item pada transaksi penjualan)
-- ===========================================================================
CREATE TABLE sales_orders (
    sales_order_id VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    sales_transaction_id VARCHAR(20) NOT NULL,
    item_code VARCHAR(20) NOT NULL,
    quantity INTEGER,
    unit_price DECIMAL(10,2),  -- Diinput manual admin (override harga jika perlu)
    subtotal_price DECIMAL(10,2),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    status TEXT,  -- Contoh: 'active', 'canceled', 'refunded'
    FOREIGN KEY (sales_transaction_id) REFERENCES sales_transactions(sales_transaction_id),
    FOREIGN KEY (item_code) REFERENCES items(item_code)
);

-- ===========================================================================
-- TABLE: sales_payments (Pembayaran penuh/parsial dari pelanggan)
-- ===========================================================================
CREATE TABLE sales_payments (
    sales_payment_id VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    sales_transaction_id VARCHAR(20) NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,  -- Misal: cash, transfer
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (sales_transaction_id) REFERENCES sales_transactions(sales_transaction_id)
);

-- ===========================================================================
-- TABLE: purchase_transactions (Header transaksi pembelian dari supplier)
-- ===========================================================================
CREATE TABLE purchase_transactions (
    purchase_transaction_id VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    admin_id VARCHAR(10) NOT NULL,
    supplier_id VARCHAR(10) NOT NULL,
    total_amount DECIMAL(10,2),
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Waktu transaksi pembelian dibuat
    updated_at TIMESTAMP,
    status TEXT,  -- Contoh: 'pending', 'approved', 'completed', 'canceled'
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- ===========================================================================
-- TABLE: purchase_orders (Detail item pada transaksi pembelian)
-- ===========================================================================
CREATE TABLE purchase_orders (
    purchase_order_id VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    purchase_transaction_id VARCHAR(20) NOT NULL,
    item_code VARCHAR(20) NOT NULL,
    quantity INTEGER,
    unit_price DECIMAL(10,2),  -- Harga beli aktual dari supplier
    subtotal_price DECIMAL(10,2),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    status TEXT,  -- Contoh: 'active', 'canceled', 'refunded'
    FOREIGN KEY (purchase_transaction_id) REFERENCES purchase_transactions(purchase_transaction_id),
    FOREIGN KEY (item_code) REFERENCES items(item_code)
);

-- ===========================================================================
-- TABLE: purchase_payments (Pembayaran penuh/parsial ke supplier)
-- ===========================================================================
CREATE TABLE purchase_payments (
    purchase_payment_id VARCHAR(20) PRIMARY KEY NOT NULL UNIQUE,
    purchase_transaction_id VARCHAR(20) NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,  -- Misal: cash, transfer
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (purchase_transaction_id) REFERENCES purchase_transactions(purchase_transaction_id)
);
