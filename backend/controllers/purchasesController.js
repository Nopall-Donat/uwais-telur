const purchasesModel = require('../models/purchasesModel');
const suppliersModel = require('../models/suppliersModel');
const itemsModel = require('../models/itemsModel');

const { getCurrentTimestampWIB } = require('../../utils/time');

const ExcelJS = require('exceljs');

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../config/printer-config.json");
const printer = require("pdf-to-printer");

async function generatePurchasePDF(id, { preview = false } = {}) {
    const { transaction, orders } = await purchasesModel.getPurchaseReceiptData(id);
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

        doc.font('Helvetica').fontSize(8);
        let y = 25;
        const colNo = 25, colItem = colNo + 20, colQty = colItem + 90, colPrice = colQty + 15, colTotal = colPrice + 40;
        const lineGap = 10;

        // 🖼️ Logo
        try {
            const logoPath = path.join(__dirname, '../../frontend/assets/img/logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, colNo, y, { width: 35 });
            }
        } catch (err) {
            console.warn('Logo gagal dimuat:', err.message);
        }

        doc.font('Helvetica-Bold').text('FAKTUR PEMBELIAN', colNo + 45, y);
        doc.font('Helvetica').fontSize(7.5);
        y += lineGap;
        doc.text('TOKO UWAIS TELUR', colNo + 45, y);
        y += lineGap;
        doc.font('Helvetica').fontSize(7);
        doc.text('JL. KAMPUNG SULIMAN NO. 70,', colNo + 45, y);
        y += lineGap;
        doc.text('DESA MEKARSARI', colNo + 45, y);
        y += lineGap;
        doc.text('082125693390', colNo + 45, y);

        doc.text(`${transaction.purchase_transaction_id}`, 189, 25);
        doc.text(`${transaction.transaction_time}`, 189, 37);

        y += lineGap * 2;
        doc.font('Helvetica').fontSize(8);
        doc.text(`Supplier : ${transaction.supplier_name}`, colNo, y);
        y += lineGap + 2;
        doc.text(`Alamat   : ${transaction.address}`, colNo, y);
        y += lineGap + 5;

        doc.font('Helvetica-Bold').fontSize(7);
        y += 5;
        doc.text('No.', colNo, y);
        doc.text('Nama Item', colItem, y);
        doc.text('Jml', colQty, y);
        doc.text('Harga', colPrice, y, { width: 55, align: 'right' });
        doc.text('Total', colTotal, y, { width: 65, align: 'right' });
        y += lineGap;
        doc.moveTo(colNo, y).lineTo(colTotal + 65, y).stroke();
        y += 3;

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

        y += 4;
        doc.moveTo(colNo, y).lineTo(colTotal + 65, y).stroke();
        y += lineGap;
        doc.font('Helvetica-Bold');
        doc.text('Total', colPrice, y, { width: 55, align: 'right' });
        doc.text(`Rp ${total.toLocaleString('id-ID')}`, colTotal, y, { width: 65, align: 'right' });
        y += lineGap + 6;

        doc.font('Helvetica').fontSize(8);
        doc.text('Pembayaran Via Transfer Melalui', colNo, y);
        y += lineGap;
        doc.text('BRI : 0938 0101 274 6502', colNo, y);
        y += lineGap;
        doc.text('BCA : 7288 428 548', colNo, y);
        y += lineGap;
        doc.text('A/N Syarifudin Ahmad', colNo, y);
        y += lineGap;

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

const purchasesController = {
    // =========================
    // Halaman Utama Pembelian
    // =========================

    // 🔷 View halaman utama
    viewIndexPurchases: async (req, res, next) => {
        try {
            const purchases = await purchasesModel.getPurchasesBySearchAndLimit('', 10, 0);
            const suppliers = await suppliersModel.getAllSupplier();

            const message = req.session.message || null;
            delete req.session.message;

            res.render('purchases/index', {
                title: 'Data Pembelian',
                purchases,
                suppliers,
                message,
                search: '',
                limit: 10,
                page: 1,
                totalPages: 1
            });
        } catch (err) {
            console.error('viewIndexPurchase error:', err);
            next(err);
        }
    },

    // 🔷 Data lengkap semua purchases (untuk API)
    getAllPurchases: async (req, res, next) => {
        try {
            const data = await purchasesModel.getPurchasesBySearchAndLimit('', 1000, 0);
            res.json(data);
        } catch (err) {
            console.error('getAllPurchases error:', err);
            next(err);
        }
    },

    // 🔷 List purchases dengan search + limit + page (AJAX)
    listPurchases: async (req, res, next) => {
        try {
            const search = req.query.search?.toLowerCase() || '';
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const [purchases, totalData] = await Promise.all([
                purchasesModel.getPurchasesBySearchAndLimit(search, limit, offset),
                purchasesModel.countPurchasesBySearch(search)
            ]);

            const totalPages = Math.ceil(totalData / limit);

            if (req.xhr) {
                res.render('purchases/_table', {
                    purchases,
                    search,
                    limit,
                    page,
                    totalPages,
                    title: 'Data Pembelian'
                }, (err, html) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Gagal render data.');
                    }
                    res.send(html);
                });
            } else {
                res.render('purchases/index', {
                    title: 'Data Pembelian',
                    purchases,
                    search,
                    limit,
                    page,
                    totalPages,
                    message: req.session.message || null
                });
                delete req.session.message;
            }
        } catch (err) {
            console.error('listPurchases error:', err);
            next(err);
        }
    },
    // 🔷 Buat transaksi pembelian baru
    createPurchase: async (req, res, next) => {
        try {
            const { supplier_id } = req.body;
            const admin_id = req.session.admin_id || 'A30042501'; // fallback testing

            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const dd = pad(now.getDate());
            const mm = pad(now.getMonth() + 1);
            const yy = String(now.getFullYear()).slice(-2);
            const dateTag = `${dd}${mm}${yy}`;

            // Ambil semua ID yang sudah ada hari ini
            const rows = await purchasesModel.getTransactionIdsByDateTag(dateTag);
            const usedNumbers = rows.map(row => {
                const match = row.purchase_transaction_id.match(/^BUY(\d{3})\d{6}$/);
                return match ? parseInt(match[1]) : null;
            }).filter(n => n !== null).sort((a, b) => a - b);

            let nomor = 1;
            while (usedNumbers.includes(nomor)) nomor++;

            const nomorUrut = String(nomor).padStart(3, '0');
            const transactionId = `BUY${nomorUrut}${dateTag}`;

            // Timestamp
            const timestamp = getCurrentTimestampWIB();

            // Simpan ke database
            await purchasesModel.createPurchaseTransaction(transactionId, admin_id, supplier_id, timestamp);

            res.redirect(`/purchases/details/${transactionId}`);

        } catch (err) {
            console.error('createPurchase error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menambahkan transaksi pembelian!' };
            res.redirect('/purchases');
        }
    },

    // 🔷 Hapus transaksi pembelian
    deletePurchase: async (req, res, next) => {
        try {
            const { id } = req.params;
            const orders = await purchasesModel.getOrdersByTransaction(id);
            for (const order of orders) {
                await itemsModel.updateStockDecrease(order.item_code, order.quantity * -1); // rollback = tambah stok
            }
            await purchasesModel.deletePurchaseById(id);

            req.session.message = { type: 'success', text: 'Transaksi berhasil dihapus.' };
            res.redirect('/purchases');
        } catch (err) {
            console.error('deletePurchase error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menghapus transaksi pembelian!' };
            res.redirect('/purchases');
        }
    },

    // =========================
    // Detail Pembelian
    // =========================

    // 🔷 Detail view transaksi pembelian
    viewPurchaseDetail: async (req, res, next) => {
        try {
            const detail = await purchasesModel.getPurchaseTransactionDetail(req.params.id);
            if (!detail) return res.status(404).send('Transaksi tidak ditemukan.');

            const itemListFromDB = await itemsModel.getAllItems();

            res.render('purchases/details', {
                title: 'Detail Transaksi Pembelian',
                detail: detail.header,
                orders: detail.orders,
                payments: detail.payments,
                items: itemListFromDB
            });
        } catch (err) {
            console.error('viewPurchaseDetail error:', err);
            next(err);
        }
    },
    // 🔷 Generate ID baru untuk item pembelian
    generateNewPurchaseOrderId: async (req, res, next) => {
        try {
            const date = new Date();
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yy = String(date.getFullYear()).slice(-2);
            const dateTag = `${dd}${mm}${yy}`;

            const rows = await purchasesModel.getUsedOrderIdsByDate(dateTag);

            const usedNumbers = rows
                .map(r => parseInt(r.purchase_order_id.slice(4, 7)))
                .filter(n => !isNaN(n))
                .sort((a, b) => a - b);

            let next = 1;
            while (usedNumbers.includes(next)) next++;

            const nomor = String(next).padStart(3, '0');
            const newId = `PORD${nomor}${dateTag}`;
            const usedIds = rows.map(r => r.purchase_order_id);

            res.json({ order_id: newId, used_ids: usedIds });
        } catch (err) {
            console.error('generateNewPurchaseOrderId error:', err);
            res.status(500).json({ error: 'Gagal generate ID pembelian.' });
        }
    },
    // 🔷 Tambah item pembelian
    addOrderToPurchase: async (req, res, next) => {
        try {
            const ensureArray = val => Array.isArray(val) ? val : [val];

            const orderIds = ensureArray(req.body.order_id);
            const itemCodes = ensureArray(req.body.item_code);
            const quantities = ensureArray(req.body.quantity);
            const unitPrices = ensureArray(req.body.unit_price);
            const transactionId = req.body.purchase_transaction_id;
            const deleteIds = ensureArray(req.body.delete_order_id);

            if (!transactionId) {
                return res.status(400).json({ error: 'ID transaksi tidak ditemukan.' });
            }

            const existingRows = await purchasesModel.getPurchaseOrderIdsByTransaction(transactionId);
            const existingIds = new Set(existingRows.map(row => row.purchase_order_id));
            const formIds = new Set();

            // 🔴 Hapus item yang ditandai
            for (const id of deleteIds) {
                if (existingIds.has(id)) {
                    const old = await purchasesModel.getOrderById(id);
                    await itemsModel.updateStockDecrease(old.item_code, old.quantity); // rollback stok
                    await purchasesModel.deletePurchaseOrderById(id);
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

                if (!id || !item || isNaN(qty) || isNaN(price) || qty <= 0 || price < 0) continue;

                formIds.add(id);

                if (existingIds.has(id)) {
                    const old = await purchasesModel.getOrderById(id);

                    await purchasesModel.updatePurchaseOrder(id, item, qty, price);

                    if (old.item_code !== item) {
                        await itemsModel.updateStockDecrease(old.item_code, old.quantity);
                        await itemsModel.updateStockIncrease(item, qty);
                    } else {
                        const delta = qty - old.quantity;
                        if (delta !== 0) await itemsModel.updateStockIncrease(item, delta);
                    }
                } else {
                    await purchasesModel.insertSinglePurchaseOrder(id, transactionId, item, qty, price);
                    await itemsModel.updateStockIncrease(item, qty);
                }

                updatedCount++;
            }

            if (updatedCount === 0 && deleteIds.length === 0) {
                return res.status(400).json({ error: 'Tidak ada data valid untuk disimpan.' });
            }

            await purchasesModel.updateTotalAmountByTransactionId(transactionId);

            const detail = await purchasesModel.getPurchaseTransactionDetail(transactionId);
            const totalPaid = detail.header.total_dibayar || 0;
            const totalTagihan = detail.header.total_tagihan || 0;
            const status = totalPaid >= totalTagihan ? 'Lunas' : 'Belum Lunas';
            await purchasesModel.updatePaymentStatus(transactionId, status);

            res.status(200).json({ message: 'Pesanan berhasil diperbarui.' });

        } catch (err) {
            console.error('addOrderToPurchase error:', err);
            res.status(500).json({ error: 'Gagal menyimpan data pembelian.' });
        }
    },


    // =========================
    // 💵 PEMBAYARAN PEMBELIAN
    // =========================

    // 🔷 Tambah pembayaran
    addPaymentToPurchase: async (req, res, next) => {
        try {
            const { purchase_transaction_id, payment_amount, payment_method } = req.body;

            if (!purchase_transaction_id || purchase_transaction_id.trim() === '') {
                return res.status(400).json({ error: 'ID transaksi tidak valid.' });
            }
            if (!payment_amount || isNaN(payment_amount)) {
                return res.status(400).json({ error: 'Jumlah pembayaran tidak valid.' });
            }

            const amount = parseFloat(payment_amount);
            if (amount <= 0) {
                return res.status(400).json({ error: 'Jumlah pembayaran harus lebih dari 0.' });
            }

            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const paymentId = `PPYM${pad(now.getDate())}${pad(now.getMonth() + 1)}${String(now.getFullYear()).slice(-2)}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

            await purchasesModel.insertPurchasePayment(paymentId, purchase_transaction_id, amount, payment_method);

            const detail = await purchasesModel.getPurchaseTransactionDetail(purchase_transaction_id);
            const totalPaid = detail.header.total_dibayar + amount;
            const totalTagihan = detail.header.total_tagihan;
            const status = totalPaid >= totalTagihan ? 'Lunas' : 'Belum Lunas';

            await purchasesModel.updatePaymentStatus(purchase_transaction_id, status);

            return res.status(200).json({ message: 'Pembayaran berhasil disimpan.' });

        } catch (err) {
            console.error('addPaymentToPurchase error:', err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan pembayaran pembelian.' });
        }
    },

    // 🔷 Ambil riwayat pembayaran
    getPurchasePaymentHistory: async (req, res) => {
        const { id } = req.params;
        try {
            const payments = await purchasesModel.getPaymentsByTransactionId(id);
            res.json(payments);
        } catch (error) {
            console.error('Gagal ambil riwayat pembayaran pembelian:', error);
            res.status(500).json({ error: 'Gagal memuat riwayat pembayaran pembelian' });
        }
    },

    // 🔷 Hapus pembayaran pembelian
    deletePurchasePayment: async (req, res) => {
        const { purchase_payment_id } = req.body;

        if (!purchase_payment_id) {
            return res.status(400).json({ error: 'ID pembayaran wajib disertakan.' });
        }

        try {
            const payment = await purchasesModel.getPaymentById(purchase_payment_id);
            if (!payment) {
                return res.status(404).json({ error: 'Pembayaran tidak ditemukan.' });
            }

            const result = await purchasesModel.deletePaymentById(purchase_payment_id);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Pembayaran gagal dihapus.' });
            }

            const totalPaid = await purchasesModel.getTotalPaidByTransaction(payment.purchase_transaction_id);
            const detail = await purchasesModel.getPurchaseTransactionDetail(payment.purchase_transaction_id);
            const totalTagihan = detail.header.total_tagihan;

            const status = totalPaid >= totalTagihan ? 'Lunas' : 'Belum Lunas';
            await purchasesModel.updatePaymentStatus(payment.purchase_transaction_id, status);

            return res.json({ message: 'Pembayaran berhasil dihapus dan status diperbarui.' });

        } catch (err) {
            console.error('deletePurchasePayment error:', err);
            res.status(500).json({ error: 'Gagal menghapus pembayaran pembelian.' });
        }
    },

    // =========================
    // Backup Data Pembelian
    // =========================
    backupPurchasesToExcel: async (req, res) => {
        try {
            const { transactions, orders, payments } = await purchasesModel.getBackupData();

            const workbook = new ExcelJS.Workbook();

            // 📄 Sheet 1: Transaksi Pembelian
            const sheet1 = workbook.addWorksheet('Data Pembelian');
            sheet1.columns = [
                { header: 'ID Transaksi', key: 'purchase_transaction_id', width: 20 },
                { header: 'Nama Supplier', key: 'supplier_name', width: 25 },
                { header: 'Total Tagihan', key: 'total_amount', width: 18 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Waktu Transaksi', key: 'transaction_time', width: 20 },
                { header: 'Admin', key: 'admin_name', width: 20 }
            ];
            transactions.forEach(row => sheet1.addRow(row));

            // 📄 Sheet 2: Rincian Order
            const sheet2 = workbook.addWorksheet('Rincian Pembelian');
            sheet2.columns = [
                { header: 'ID Order', key: 'purchase_order_id', width: 20 },
                { header: 'ID Transaksi', key: 'purchase_transaction_id', width: 20 },
                { header: 'Nama Barang', key: 'item_type', width: 25 },
                { header: 'Jumlah', key: 'quantity', width: 10 },
                { header: 'Harga Satuan', key: 'unit_price', width: 15 },
                { header: 'Subtotal', key: 'subtotal_price', width: 15 },
                { header: 'Waktu Pesan', key: 'order_time', width: 20 }
            ];
            orders.forEach(row => sheet2.addRow(row));

            // 📄 Sheet 3: Riwayat Pembayaran
            const sheet3 = workbook.addWorksheet('Pembayaran');
            sheet3.columns = [
                { header: 'ID Pembayaran', key: 'purchase_payment_id', width: 20 },
                { header: 'ID Transaksi', key: 'purchase_transaction_id', width: 20 },
                { header: 'Jumlah Dibayar', key: 'payment_amount', width: 18 },
                { header: 'Metode Pembayaran', key: 'payment_method', width: 18 },
                { header: 'Waktu Pembayaran', key: 'payment_time', width: 20 }
            ];
            payments.forEach(row => sheet3.addRow(row));

            // 🔽 Output ke browser
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=backup_pembelian.xlsx');
            await workbook.xlsx.write(res);
            res.end();

        } catch (err) {
            console.error('backupPurchasesToExcel error:', err);
            res.status(500).send('Gagal membuat file Excel');
        }
    },

    // =========================
    // Cetak Nota Pembelian
    // =========================
    previewPurchaseReceipt: async (req, res) => {
        const { id } = req.params;
        const fileName = `nota-${id}.pdf`;
        const filePath = path.join(__dirname, `../../temp/${fileName}`);

        try {
            if (!fs.existsSync(filePath)) {
                await generatePurchasePDF(id, { preview: true });
            }
            res.sendFile(filePath);
        } catch (err) {
            console.error("previewPurchaseReceipt error:", err.message);
            res.status(500).send("Gagal menampilkan preview nota.");
        }
    },

    getPrinterList: async (req, res) => {
        try {
            const printers = await printer.getPrinters();
            res.json(printers);
        } catch (err) {
            console.error("❌ Gagal mengambil daftar printer:", err);
            res.status(500).json({ error: "Gagal mengambil daftar printer", detail: err.message });
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
        if (!printerName) return res.status(400).json({ error: "Nama printer tidak boleh kosong" });

        const config = { defaultPrinter: printerName };
        try {
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            res.json({ message: "Printer default berhasil disimpan" });
        } catch (err) {
            res.status(500).json({ error: "Gagal menyimpan printer default" });
        }
    },

    printPurchaseReceipt: async (req, res) => {
        const { id } = req.params;
        const { printer: printerName } = req.body;

        if (!printerName) {
            return res.status(400).json({ error: "Nama printer tidak boleh kosong." });
        }

        let filePath;
        try {
            filePath = await generatePurchasePDF(id, { preview: false });

            await printer.print(filePath, {
                printer: printerName,
                win32: ['-print-settings "portrait"', '-print-settings "fit"', "-silent"]
            });

            return res.json({ message: `Nota berhasil dicetak ke printer "${printerName}".` });
        } catch (err) {
            console.error("❌ Gagal cetak nota:", err.message);
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(500).json({ error: "Gagal mencetak nota pembelian." });
        }
    },
};

module.exports = purchasesController;