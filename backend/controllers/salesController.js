const salesModel = require("../models/salesModel");
const customerModel = require("../models/customersModel");
const itemsModel = require("../models/itemsModel");

const { getCurrentTimestampWIB } = require("../../utils/time");

const ExcelJS = require("exceljs");

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../config/printer-config.json");
const printer = require("pdf-to-printer");

async function generateSalesPDF(id, { preview = false } = {}) {
    const { transaction, orders } = await salesModel.getSalesReceiptData(id);
    if (!transaction) throw new Error('Transaksi tidak ditemukan.');

    const fileName = preview ? `nota-${id}.pdf` : `nota-thermal-${id}.pdf`;
    const filePath = path.join(__dirname, `../../temp/${fileName}`);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'portrait',
            margins: { top: 25, left: 25, right: 25, bottom: 25 }
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ✅ Font Helvetica (rapih dan tidak blur)
        doc.font('Helvetica').fontSize(8);

        // === Setup posisi dan ukuran
        let y = 25;
        const colNo = 25;
        const colItem = colNo + 20;
        const colQty = colItem + 90;
        const colPrice = colQty + 15;
        const colTotal = colPrice + 40;
        const lineGap = 10;

        // === 🖼️ LOGO
        try {
            const logoPath = path.join(__dirname, '../../frontend/assets/img/logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, colNo, y, { width: 35 });
            }
        } catch (err) {
            console.warn('Logo gagal dimuat:', err.message);
        }

        // === HEADER KANAN
        doc.font('Helvetica-Bold').text('FAKTUR PENJUALAN', colNo + 45, y);
        doc.font('Helvetica').fontSize(7.5);
        y += lineGap;
        doc.text('TOKO UWAIS TELUR', colNo + 45, y);
        doc.font('Helvetica').fontSize(7);
        y += lineGap;
        doc.text('JL. KAMPUNG SULIMAN NO. 70,', colNo + 45, y);
        y += lineGap;
        doc.text('DESA MEKARSARI', colNo + 45, y);
        y += lineGap;
        doc.text('082125693390', colNo + 45, y);

        doc.text(`${transaction.sales_transaction_id}`, 189, 25);
        doc.text(`${transaction.transaction_time}`, 189, 37);

        doc.font('Helvetica').fontSize(8);
        // === INFO PELANGGAN
        y += lineGap * 2;
        doc.text(`Pelanggan : ${transaction.customer_name}`, colNo, y);
        y += lineGap + 2;
        doc.text(`Alamat    : ${transaction.address}`, colNo, y);
        y += lineGap + 5;

        // === HEADER TABEL
        y += 5;
        doc.font('Helvetica-Bold').fontSize(7);
        doc.text('No.', colNo, y);
        doc.text('Nama Item', colItem, y);
        doc.text('Jml', colQty, y);
        doc.text('Harga', colPrice, y, { width: 55, align: 'right' });
        doc.text('Total', colTotal, y, { width: 65, align: 'right' });
        y += lineGap;
        doc.moveTo(colNo, y).lineTo(colTotal + 65, y).stroke();
        y += 3;

        // === ISI TABEL
        doc.font('Helvetica');
        let total = 0;
        orders.forEach((item, i) => {
            const harga = item.unit_price || 0;
            const subtotal = item.subtotal_price || 0;
            total += subtotal;

            doc.text(`${i + 1}`, colNo, y);
            doc.text(item.item_name, colItem, y, { width: 145 });
            doc.text(`${item.quantity}`, colQty, y);
            doc.text(`Rp ${harga.toLocaleString('id-ID')}`, colPrice, y, { width: 55, align: 'right' });
            doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, colTotal, y, { width: 65, align: 'right' });
            y += lineGap;
        });

        // === TOTAL
        y += 4;
        doc.moveTo(colNo, y).lineTo(colTotal + 65, y).stroke();
        y += lineGap;
        doc.font('Helvetica-Bold');
        doc.text('Total', colPrice, y, { width: 55, align: 'right' });
        doc.text(`Rp ${total.toLocaleString('id-ID')}`, colTotal, y, { width: 65, align: 'right' });
        y += lineGap + 6;

        // === INFO TRANSFER
        doc.font('Helvetica').fontSize(8);
        doc.text('Pembayaran Via Transfer Melalui', colNo, y);
        y += lineGap;
        doc.text('BRI : 0938 0101 274 6502', colNo, y);
        y += lineGap;
        doc.text('BCA : 7288 428 548', colNo, y);
        y += lineGap;
        doc.text('A/N Syarifudin Ahmad', colNo, y);
        y += lineGap;

        // === TANDA TANGAN
        doc.text('Hormat Kami', colPrice - 10, y);
        doc.text('Penerima', colTotal + 10, y);
        y += lineGap * 2;
        doc.text('(......................)', colPrice - 10, y);
        doc.text('(......................)', colTotal + 10, y);

        doc.end();
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
    });
}

const salesController = {
    // =========================
    // Halaman Utama Penjualan
    // =========================

    // 🔷 View halaman utama
    viewIndexSales: async (req, res, next) => {
        try {
            const sales = await salesModel.getSalesBySearchAndLimit("", 10, 0);
            const customers = await customerModel.getAllCustomer();

            const message = req.session.message || null;
            delete req.session.message;

            res.render("sales/index", {
                title: "Data Penjualan",
                sales,
                customers,
                message,
                search: "",
                limit: 10,
                page: 1,
                totalPages: 1,
            });
        } catch (err) {
            console.error("viewIndexSales error:", err);
            next(err);
        }
    },
    // 🔷 Data lengkap semua sales (untuk API)
    getAllSales: async (req, res, next) => {
        try {
            const data = await salesModel.getSalesBySearchAndLimit("", 1000, 0);
            res.json(data);
        } catch (err) {
            console.error("getAllSales error:", err);
            next(err);
        }
    },
    // 🔷 List sales dengan search + limit + page (AJAX)
    listSales: async (req, res, next) => {
        try {
            const search = req.query.search?.toLowerCase() || "";
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const [sales, totalData] = await Promise.all([
                salesModel.getSalesBySearchAndLimit(search, limit, offset),
                salesModel.countSalesBySearch(search),
            ]);

            const statusList = ["lunas", "belum lunas", "dibatalkan"];
            const keyword = search.trim().toLowerCase();

            let filteredSales = sales;

            if (statusList.includes(keyword)) {
                filteredSales = sales.filter(
                    (tx) => tx.status_pembayaran.toLowerCase() === keyword
                );
            }

            const totalPages = Math.ceil(totalData / limit);

            if (req.xhr) {
                res.render(
                    "sales/_table",
                    {
                        sales: filteredSales,
                        search,
                        limit,
                        page,
                        totalPages,
                        title: "Data Penjualan",
                    },
                    (err, html) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send("Gagal render data.");
                        }
                        res.send(html);
                    }
                );
            } else {
                res.render("sales/index", {
                    title: "Data Penjualan",
                    sales: filteredSales,
                    search,
                    limit,
                    page,
                    totalPages,
                    message: req.session.message || null,
                });
                delete req.session.message;
            }
        } catch (err) {
            console.error("listSales error:", err);
            next(err);
        }
    },
    createSales: async (req, res, next) => {
        try {
            const { customer_id } = req.body;
            const admin_id = req.session.admin_id || "A30042501"; // fallback testing

            const now = new Date();
            const pad = (n) => String(n).padStart(2, "0");
            const dd = pad(now.getDate());
            const mm = pad(now.getMonth() + 1);
            const yy = String(now.getFullYear()).slice(-2);
            const dateTag = `${dd}${mm}${yy}`;

            // Ambil semua ID yang sudah ada hari ini
            const rows = await salesModel.getTransactionIdsByDateTag(dateTag);
            const usedNumbers = rows
                .map((row) => {
                    const match = row.sales_transaction_id.match(/^SELL(\d{3})\d{6}$/);
                    return match ? parseInt(match[1]) : null;
                })
                .filter((n) => n !== null)
                .sort((a, b) => a - b);

            let nomor = 1;
            while (usedNumbers.includes(nomor)) nomor++;

            const nomorUrut = String(nomor).padStart(3, "0");
            const transactionId = `SELL${nomorUrut}${dateTag}`;

            // Waktu dalam format WIB
            const timestamp = getCurrentTimestampWIB();

            // Simpan ke DB
            await salesModel.createSalesTransaction(
                transactionId,
                admin_id,
                customer_id,
                timestamp
            );

            res.redirect(`/details/${transactionId}`);
        } catch (err) {
            console.error("createSales error:", err);
            req.session.message = {
                type: "danger",
                text: "Gagal menambahkan transaksi!",
            };
            res.redirect("/");
        }
    },
    // 🔷 Hapus transaksi
    deleteSales: async (req, res, next) => {
        try {
            const { id } = req.params;
            const orders = await salesModel.getOrdersByTransaction(id);
            for (const order of orders) {
                await itemsModel.updateStockIncrease(order.item_code, order.quantity); // rollback = tambah stok
            }
            await salesModel.deleteSalesById(id);

            req.session.message = {
                type: "success",
                text: "Transaksi berhasil dihapus.",
            };
            res.redirect("/");
        } catch (err) {
            console.error("deleteSales error:", err);
            req.session.message = {
                type: "danger",
                text: "Gagal menghapus transaksi!",
            };
            res.redirect("/");
        }
    },

    // =========================
    // Detail Pesanan Transaksi
    // =========================

    // 🔷 Detail view (render HTML)
    viewSalesDetail: async (req, res, next) => {
        try {
            const detail = await salesModel.getSalesTransactionDetail(req.params.id);
            if (!detail) return res.status(404).send("Transaksi tidak ditemukan.");

            const itemListFromDB = await itemsModel.getAllItems();

            res.render("sales/details", {
                title: "Detail Transaksi Penjualan",
                detail: detail.header,
                orders: detail.orders,
                payments: detail.payments,
                items: itemListFromDB,
            });
        } catch (err) {
            console.error("viewSalesDetail error:", err);
            next(err);
        }
    },
    // 🔷 Generate ID baru untuk transaksi penjualan
    generateNewOrderId: async (req, res, next) => {
        try {
            const date = new Date();
            const dd = String(date.getDate()).padStart(2, "0");
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const yy = String(date.getFullYear()).toString().slice(-2);
            const tanggalTag = `${dd}${mm}${yy}`;

            const rows = await salesModel.getUsedOrderIdsByDate(tanggalTag);

            const urutanTerpakai = rows
                .map((r) => parseInt(r.sales_order_id.slice(4, 7)))
                .filter((n) => !isNaN(n))
                .sort((a, b) => a - b);

            let next = 1;
            while (urutanTerpakai.includes(next)) next++;

            const nomor = String(next).padStart(3, "0");
            const newId = `SORD${nomor}${tanggalTag}`;
            const usedIds = rows.map((r) => r.sales_order_id);

            res.json({ order_id: newId, used_ids: usedIds });
        } catch (err) {
            console.error("generateNewOrderId error:", err);
            res.status(500).json({ error: "Gagal generate ID." });
        }
    },
    // 🔷 Tambah item
    addOrderToSales: async (req, res, next) => {
        try {
            const ensureArray = (val) => (Array.isArray(val) ? val : [val]);

            const orderIds = ensureArray(req.body.order_id);
            const itemCodes = ensureArray(req.body.item_code);
            const quantities = ensureArray(req.body.quantity);
            const unitPrices = ensureArray(req.body.unit_price);
            const transactionId = req.body.sales_transaction_id;
            const deleteIds = ensureArray(req.body.delete_order_id);

            if (!transactionId) {
                return res.status(400).json({ error: "ID transaksi tidak ditemukan." });
            }

            const existingRows = await salesModel.getSalesOrderIdsByTransaction(
                transactionId
            );
            const existingIds = new Set(
                existingRows.map((row) => row.sales_order_id)
            );
            const formIds = new Set();

            // 🔴 Hapus item yang ditandai
            for (const id of deleteIds) {
                if (existingIds.has(id)) {
                    const old = await salesModel.getOrderById(id);
                    await itemsModel.updateStockIncrease(old.item_code, old.quantity); // rollback stok
                    await salesModel.deleteSalesOrderById(id);
                    existingIds.delete(id);
                }
            }

            let updatedCount = 0;

            for (let i = 0; i < orderIds.length; i++) {
                const id = orderIds[i];
                if (deleteIds.includes(id)) continue;

                const item = itemCodes[i];
                const qty = parseInt(quantities[i]);
                const price = parseInt(unitPrices[i]);

                if (!id || !item || isNaN(qty) || isNaN(price) || qty <= 0 || price < 0)
                    continue;

                formIds.add(id);

                if (existingIds.has(id)) {
                    const old = await salesModel.getOrderById(id);

                    await salesModel.updateSalesOrder(id, item, qty, price);

                    if (old.item_code !== item) {
                        await itemsModel.updateStockIncrease(old.item_code, old.quantity);
                        await itemsModel.updateStockDecrease(item, qty);
                    } else {
                        const delta = qty - old.quantity;
                        if (delta !== 0) await itemsModel.updateStockDecrease(item, delta);
                    }
                } else {
                    await salesModel.insertSingleSalesOrder(
                        id,
                        transactionId,
                        item,
                        qty,
                        price
                    );
                    await itemsModel.updateStockDecrease(item, qty);
                }

                updatedCount++;
            }

            if (updatedCount === 0 && deleteIds.length === 0) {
                return res
                    .status(400)
                    .json({ error: "Tidak ada data valid untuk disimpan." });
            }

            await salesModel.updateTotalAmountByTransactionId(transactionId);

            const detail = await salesModel.getSalesTransactionDetail(transactionId);
            const totalPaid = detail.header.total_dibayar || 0;
            const totalTagihan = detail.header.total_tagihan || 0;
            const status = totalPaid >= totalTagihan ? "Lunas" : "Belum Lunas";
            await salesModel.updatePaymentStatus(transactionId, status);

            res.status(200).json({ message: "Pesanan berhasil diperbarui." });
        } catch (err) {
            console.error("addOrderToSales error:", err);
            res.status(500).json({ error: "Gagal menyimpan pesanan." });
        }
    },

    // =========================
    // 💵 PEMBAYARAN
    // =========================

    // 🔷 Tambah pembayaran
    addPaymentToSales: async (req, res, next) => {
        try {
            const { sales_transaction_id, payment_amount, payment_method } = req.body;

            if (!sales_transaction_id || sales_transaction_id.trim() === "") {
                return res.status(400).json({ error: "ID transaksi tidak valid." });
            }
            if (!payment_amount || isNaN(payment_amount)) {
                return res
                    .status(400)
                    .json({ error: "Jumlah pembayaran tidak valid." });
            }

            const amount = parseFloat(payment_amount);
            if (amount <= 0) {
                return res
                    .status(400)
                    .json({ error: "Jumlah pembayaran harus lebih dari 0." });
            }

            // ✅ FIXED ID GENERATOR (Bersih & Unik)
            const now = new Date();
            const pad = (n) => String(n).padStart(2, "0");
            const paymentId = `PAY${pad(now.getDate())}${pad(
                now.getMonth() + 1
            )}${String(now.getFullYear()).slice(-2)}${pad(now.getHours())}${pad(
                now.getMinutes()
            )}${pad(now.getSeconds())}`;

            // 🔄 Simpan ke DB
            await salesModel.insertSalesPayment(
                paymentId,
                sales_transaction_id,
                amount,
                payment_method
            );

            // 🔁 Update status pembayaran (completed/pending)
            const detail = await salesModel.getSalesTransactionDetail(
                sales_transaction_id
            );
            const totalPaid = detail.header.total_dibayar + amount;
            const totalTagihan = detail.header.total_tagihan;
            const status = totalPaid >= totalTagihan ? "Lunas" : "Belum Lunas";

            await salesModel.updatePaymentStatus(sales_transaction_id, status);

            return res.status(200).json({ message: "Pembayaran berhasil disimpan." });
        } catch (err) {
            console.error("addPaymentToSales error:", err);
            return res
                .status(500)
                .json({ error: "Terjadi kesalahan saat menyimpan pembayaran." });
        }
    },

    getSalesPaymentHistory: async (req, res) => {
        const { id } = req.params;
        try {
            const payments = await salesModel.getPaymentsByTransactionId(id);
            res.json(payments);
        } catch (error) {
            console.error("Gagal ambil riwayat pembayaran:", error);
            res.status(500).json({ error: "Gagal memuat data riwayat pembayaran" });
        }
    },

    // 🔷 Hapus pembayaran
    deleteSalesPayment: async (req, res) => {
        const { sales_payment_id } = req.body;

        if (!sales_payment_id) {
            return res.status(400).json({ error: "ID pembayaran wajib disertakan." });
        }

        try {
            // ✅ Ambil data pembayaran
            const payment = await salesModel.getPaymentById(sales_payment_id);

            if (!payment) {
                return res.status(404).json({ error: "Pembayaran tidak ditemukan." });
            }

            const result = await salesModel.deletePaymentById(sales_payment_id);
            if (result.changes === 0) {
                return res.status(404).json({ error: "Pembayaran tidak ditemukan." });
            }

            const totalPaid = await salesModel.getTotalPaidByTransaction(
                payment.sales_transaction_id
            );
            const detail = await salesModel.getSalesTransactionDetail(
                payment.sales_transaction_id
            );
            const totalTagihan = detail.header.total_tagihan;

            const status = totalPaid >= totalTagihan ? "Lunas" : "Belum Lunas";
            await salesModel.updatePaymentStatus(
                payment.sales_transaction_id,
                status
            );

            return res.json({
                message: "Pembayaran berhasil dihapus dan status diperbarui.",
            });
        } catch (err) {
            console.error("deleteSalesPayment error:", err);
            res.status(500).json({ error: "Gagal menghapus pembayaran." });
        }
    },

    // =========================
    // Backup Data Penjualan
    // =========================
    backupSalesToExcel: async (req, res) => {
        try {
            const { transactions, orders, payments } =
                await salesModel.getBackupData();

            const workbook = new ExcelJS.Workbook();

            // 🟦 Sheet 1: Transaksi
            const sheet1 = workbook.addWorksheet("Data Transaksi");
            sheet1.columns = [
                { header: "ID Transaksi", key: "sales_transaction_id", width: 20 },
                { header: "Nama Pelanggan", key: "customer_name", width: 20 },
                { header: "Alamat", key: "address", width: 25 },
                { header: "Total Tagihan", key: "total_amount", width: 18 },
                { header: "Status", key: "status", width: 15 },
                { header: "Waktu Transaksi", key: "transaction_time", width: 20 },
                { header: "Admin", key: "admin_name", width: 20 },
            ];
            transactions.forEach((row) => sheet1.addRow(row));

            // 🟧 Sheet 2: Detail Order
            const sheet2 = workbook.addWorksheet("Rincian Pesanan");
            sheet2.columns = [
                { header: "ID Order", key: "sales_order_id", width: 20 },
                { header: "ID Transaksi", key: "sales_transaction_id", width: 20 },
                { header: "Nama Barang", key: "item_type", width: 25 },
                { header: "Jumlah", key: "quantity", width: 10 },
                { header: "Harga Satuan", key: "unit_price", width: 15 },
                { header: "Subtotal", key: "subtotal_price", width: 15 },
                { header: "Waktu Pesan", key: "order_time", width: 20 },
            ];
            orders.forEach((row) => sheet2.addRow(row));

            // 🟩 Sheet 3: Riwayat Pembayaran
            const sheet3 = workbook.addWorksheet("Pembayaran");
            sheet3.columns = [
                { header: "ID Pembayaran", key: "sales_payment_id", width: 20 },
                { header: "ID Transaksi", key: "sales_transaction_id", width: 20 },
                { header: "Jumlah Dibayar", key: "payment_amount", width: 18 },
                { header: "Metode Pembayaran", key: "payment_method", width: 18 },
                { header: "Waktu Pembayaran", key: "payment_time", width: 20 },
            ];
            payments.forEach((row) => sheet3.addRow(row));

            // Output
            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=backup_penjualan.xlsx"
            );
            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            console.error("backupSalesToExcel error:", err);
            res.status(500).send("Gagal membuat file Excel");
        }
    },

    // =========================
    // Cetak Nota Penjualan
    // =========================
    previewSalesReceipt: async (req, res) => {
        const { id } = req.params;
        const fileName = `nota-${id}.pdf`;
        const filePath = path.join(__dirname, `../../temp/${fileName}`);

        try {
            if (!fs.existsSync(filePath)) {
                await generateSalesPDF(id, { preview: true });
            }

            // Ganti streaming → Kirim file langsung
            res.sendFile(filePath);
        } catch (err) {
            console.error("previewSalesReceipt error:", err.message);
            res.status(500).send("Gagal menampilkan preview nota.");
        }
    },

    getPrinterList: async (req, res) => {
        try {
            const printers = await printer.getPrinters();
            // console.log('🖨️ Printer list:', printers);
            res.json(printers);
        } catch (err) {
            console.error("❌ Gagal mengambil daftar printer:", err);
            res
                .status(500)
                .json({ error: "Gagal mengambil daftar printer", detail: err.message });
        }
    },

    getDefaultPrinter: (req, res) => {
        try {
            if (!fs.existsSync(configPath)) return res.json({ defaultPrinter: null });

            const configRaw = fs.readFileSync(configPath, "utf-8");
            const config = JSON.parse(configRaw);

            res.json({ defaultPrinter: config.defaultPrinter || null });
        } catch (err) {
            console.error("Gagal baca printer default:", err.message);
            res.status(500).json({ error: "Gagal membaca printer default" });
        }
    },

    setDefaultPrinter: (req, res) => {
        const { printerName } = req.body;
        if (!printerName)
            return res.status(400).json({ error: "Nama printer tidak boleh kosong" });

        const config = { defaultPrinter: printerName };
        try {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            res.json({ message: "Printer default berhasil disimpan" });
        } catch (err) {
            res.status(500).json({ error: "Gagal menyimpan printer default" });
        }
    },

    printSalesReceipt: async (req, res) => {
        const { id } = req.params;
        const { printer: printerName } = req.body;

        if (!printerName) {
            return res
                .status(400)
                .json({ error: "Nama printer tidak boleh kosong." });
        }

        let filePath;
        try {
            filePath = await generateSalesPDF(id, { preview: false });

            await printer.print(filePath, {
                printer: printerName,
                win32: [
                    '-print-settings "portrait"',
                    '-print-settings "fit"',
                    "-silent",
                ],
            });

            return res.json({
                message: `Nota berhasil dicetak ke printer "${printerName}".`,
            });
        } catch (err) {
            console.error("❌ Gagal cetak nota:", err.message);
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(500).json({ error: "Gagal mencetak nota thermal." });
        }
    },
};

module.exports = salesController;
