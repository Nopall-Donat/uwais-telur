// 🌐 GLOBAL SHARED STATE
let rowToDelete = null;
let tempRows = [];
let usedUruts = new Set();
const items = JSON.parse(document.getElementById('item-data').textContent);


// ======================
// ✅ TOAST HANDLER
// ======================
function toastSuccess(msg) {
    const toastBody = document.getElementById('mainToastBody');
    const toastEl = document.getElementById('mainToast');
    if (!toastBody || !toastEl) return;
    toastEl.classList.remove('text-bg-danger');
    toastEl.classList.add('text-bg-success');
    toastBody.textContent = msg;
    new bootstrap.Toast(toastEl).show();
}

function toastError(msg) {
    const toastBody = document.getElementById('mainToastBody');
    const toastEl = document.getElementById('mainToast');
    if (!toastBody || !toastEl) return;
    toastEl.classList.remove('text-bg-success');
    toastEl.classList.add('text-bg-danger');
    toastBody.textContent = msg;
    new bootstrap.Toast(toastEl).show();
}

// ======================
// 🌐 GLOBAL ORDER ID FUNCTION UTILS
// ======================
let orderIdPrefix = '';
let orderIdTanggal = '';
let usedIdsFromDB = new Set();

async function fetchInitialOrderIdInfo() {
    try {
        const res = await fetch('/generate/order-id');
        const data = await res.json();
        const fullId = data.order_id;
        orderIdPrefix = fullId.slice(0, 4);       // e.g. SORD
        orderIdTanggal = fullId.slice(7);         // e.g. 030525
        usedIdsFromDB = new Set(data.used_ids);
        data.used_ids.forEach(id => {
            const urut = parseInt(id.slice(4, 7));
            if (!isNaN(urut)) usedUruts.add(urut);
        });
    } catch (err) {
        console.error('Gagal fetch order ID:', err);
    }
}

function isIdUsed(urut) {
    const id = `${orderIdPrefix}${String(urut).padStart(3, '0')}${orderIdTanggal}`;
    return usedUruts.has(urut) || usedIdsFromDB.has(id);
}

function getNextAvailableUrut() {
    let urut = 1;
    while (isIdUsed(urut)) urut++;
    usedUruts.add(urut);
    return urut;
}

function buildOrderId(urut) {
    return `${orderIdPrefix}${String(urut).padStart(3, '0')}${orderIdTanggal}`;
}

function reindexTempRows() {
    const rowsToReindex = tempRows.filter(row => !row.dom.hasAttribute('data-persisted'));
    rowsToReindex.forEach(r => usedUruts.delete(r.urut));
    rowsToReindex.forEach(row => {
        const newUrut = getNextAvailableUrut();
        row.urut = newUrut;
        row.dom.querySelector('input[name="order_id[]"]').value = buildOrderId(newUrut);
    });
}

async function addOrderRow() {
    if (!orderIdPrefix || !orderIdTanggal) await fetchInitialOrderIdInfo();

    const urutBaru = getNextAvailableUrut();
    const orderId = buildOrderId(urutBaru);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="form-control" name="order_id[]" value="${orderId}" readonly></td>
        <td><select class="form-select item-code-select" name="item_code[]">
            <option value="">-- Pilih --</option>
            ${items.map(item => `<option value="${item.item_code}">${item.item_code}</option>`).join('')}</select></td>
        <td><input type="text" class="form-control item-name" name="item_name[]" readonly></td>
        <td><input type="number" class="form-control item-qty" name="quantity[]" min="1" value="1"></td>
        <td><input type="number" class="form-control item-price" name="unit_price[]" min="0" step="100" value="0"></td>
        <td><input type="number" class="form-control item-subtotal" name="subtotal[]" readonly></td>
        <td><button type="button" class="btn btn-danger btn btn-delete-row bi bi-trash-fill"></button></td>`;

    bindRowEvents(row);
    tableBody.appendChild(row);
    tempRows.push({ urut: urutBaru, dom: row });
}

// ======================
// Helper Functions Amount
// ======================
// ✅ Update total tagihan
function updateTotalAmount() {
    const subtotals = document.querySelectorAll('.item-subtotal');
    let total = 0;
    subtotals.forEach(input => total += parseFloat(input.value) || 0);
    const totalAmountDisplay = document.getElementById('totalAmount');
    if (totalAmountDisplay) totalAmountDisplay.textContent = total.toLocaleString('id-ID');
}

// ✅ Event binding untuk row
function bindRowEvents(row) {
    const select = row.querySelector('.item-code-select');
    const nameInput = row.querySelector('.item-name');
    const qtyInput = row.querySelector('.item-qty');
    const priceInput = row.querySelector('.item-price');
    const subtotalInput = row.querySelector('.item-subtotal');

    function updateSubtotal() {
        const qty = parseFloat(qtyInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        subtotalInput.value = (qty * price).toFixed(0);
        updateTotalAmount();
    }

    select.addEventListener('change', () => {
        const selectedItem = items.find(i => i.item_code === select.value);
        nameInput.value = selectedItem ? selectedItem.item_type : '';
        priceInput.value = selectedItem ? selectedItem.selling_price : 0;
        updateSubtotal();
    });

    qtyInput.addEventListener('input', updateSubtotal);
    priceInput.addEventListener('input', updateSubtotal);

    updateSubtotal();
}

// ======================
// Helper Functions Payment
// ======================
function renderRiwayatPembayaran(data) {
    const tbody = document.getElementById('riwayatPembayaranBody');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        return tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Belum ada pembayaran.</td></tr>`;
    }

    data.forEach((pembayaran, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${new Date(pembayaran.payment_time).toLocaleString('id-ID')}</td>
            <td>Rp ${parseInt(pembayaran.payment_amount).toLocaleString('id-ID')}</td>
            <td>${pembayaran.payment_method}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger btn-hapus-payment"
                        data-id="${pembayaran.sales_payment_id}">
                    Hapus
                </button>
            </td>

        `;
        tbody.appendChild(tr);
    });
}
async function loadRiwayatPembayaran(transactionId) {
    const tbody = document.getElementById('riwayatPembayaranBody');
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Memuat data...</td></tr>`;

    try {
        const res = await fetch(`/payments/${transactionId}`);
        const data = await res.json();
        renderRiwayatPembayaran(data);
    } catch (err) {
        console.error('Gagal load riwayat pembayaran:', err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal memuat data.</td></tr>`;
    }
}

// ======================
// Helper Functions Initialization
// ======================
function initializeExistingRows() {
    const tableBody = document.getElementById('orderTableBody');
    const existingRows = tableBody.querySelectorAll('tr[data-persisted="true"]');

    existingRows.forEach(row => {
        const orderId = row.querySelector('input[name="order_id[]"]')?.value || '';
        const urut = parseInt(orderId.slice(4, 7));
        if (!isNaN(urut)) usedUruts.add(urut);
        tempRows.push({ urut, dom: row });
        bindRowEvents(row);
    });

    if (existingRows.length === 0) addOrderRow();
}

// ======================
// 🧾 Modul Order
// ======================
document.addEventListener('DOMContentLoaded', () => {
    window.tableBody = document.getElementById('orderTableBody');
    window.btnAdd = document.getElementById('btnTambahOrder');

    if (!btnAdd || !tableBody) return;

    initializeExistingRows();

    // ➕ Tambah baris baru
    btnAdd?.addEventListener('click', addOrderRow);

    // 🗑️ Hapus baris
    tableBody.addEventListener('click', e => {
        if (e.target.classList.contains('btn-delete-row')) {
            const row = e.target.closest('tr');
            const isPersisted = row.getAttribute('data-persisted') === 'true';
            const index = tempRows.findIndex(r => r.dom === row);
            if (index === -1) return;

            if (isPersisted) {
                rowToDelete = { row, index };
                new bootstrap.Modal(document.getElementById('modalKonfirmasiHapusOrder')).show();
            } else {
                if (confirm("Apakah yakin ingin menghapus item ini?")) {
                    usedUruts.delete(tempRows[index].urut);
                    tempRows.splice(index, 1);
                    row.remove();
                    reindexTempRows();
                    updateTotalAmount();
                }
            }
        }
    });
});

// ======================
// 🧾 Konfirmasi Submit dan Hapus Order
// ======================
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('orderForm');
    const toastEl = document.getElementById('orderToast');
    const toastBody = document.getElementById('orderToastBody');
    const toast = new bootstrap.Toast(toastEl);
    const btnSubmitOrder = document.getElementById('btnSubmitOrder');
    const btnKonfirmasiSimpan = document.getElementById('btnKonfirmasiSimpan');
    const modalKonfirmasiEl = document.getElementById('modalKonfirmasiSimpan');
    const btnKonfirmasiHapus = document.getElementById('btnKonfirmasiHapusOrder');
    const modalHapusEl = document.getElementById('modalKonfirmasiHapusOrder');

    // ⏎ Intersepsi tombol submit utama
    btnSubmitOrder?.addEventListener('click', function (e) {
        e.preventDefault();
        const modal = new bootstrap.Modal(modalKonfirmasiEl);
        modal.show();
    });

    // ✅ Submit setelah konfirmasi
    btnKonfirmasiSimpan?.addEventListener('click', async function () {
        const formData = new FormData();
        const transactionId = form.querySelector('input[name="sales_transaction_id"]').value;
        formData.append('sales_transaction_id', transactionId);

        const rows = form.querySelectorAll('#orderTableBody tr');
        let foundRow = false;

        rows.forEach(row => {
            const orderId = row.querySelector('input[name="order_id[]"]')?.value;
            const itemCode = row.querySelector('select[name="item_code[]"]')?.value;
            const quantity = row.querySelector('input[name="quantity[]"]')?.value;
            const unitPrice = row.querySelector('input[name="unit_price[]"]')?.value;

            if (orderId && itemCode && quantity && unitPrice) {
                formData.append('order_id[]', orderId);
                formData.append('item_code[]', itemCode);
                formData.append('quantity[]', quantity);
                formData.append('unit_price[]', unitPrice);
                foundRow = true;
            }
        });

        // 🔴 Kirim ID pesanan yang ingin dihapus
        rows.forEach(row => {
            if (row.dataset.pendingDelete === 'true') {
                const orderId = row.querySelector('input[name="order_id[]"]')?.value;
                if (orderId) {
                    formData.append('delete_order_id', orderId);
                }
            }
        });

        if (!foundRow && !formData.has('delete_order_id')) {
            toastBody.textContent = 'Form pesanan tidak boleh kosong!';
            toastEl.classList.replace('text-bg-success', 'text-bg-danger');
            return toast.show();
        }

        try {
            const response = await fetch('/order', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                toastBody.textContent = result.message || 'Data berhasil disimpan.';
                toastEl.classList.replace('text-bg-danger', 'text-bg-success');
                toast.show();

                rows.forEach(row => {
                    const itemCode = row.querySelector('select[name="item_code[]"]')?.value;
                    const qty = parseInt(row.querySelector('input[name="quantity[]"]')?.value);
                    if (!itemCode || itemCode.trim() === '' || isNaN(qty) || qty <= 0) {
                        row.remove();
                    }
                });

                rows.forEach(row => {
                    if (row.dataset.pendingDelete === 'true') {
                        row.remove();
                    }
                });

                updateTotalAmount();
                bootstrap.Modal.getInstance(modalKonfirmasiEl)?.hide();

                setTimeout(() => {
                    window.location.href = `/details/${transactionId}`;
                }, 1000);
            } else {
                toastBody.textContent = result.error || 'Gagal menyimpan data.';
                toastEl.classList.replace('text-bg-success', 'text-bg-danger');
                toast.show();
            }

        } catch (err) {
            console.error('Submit error:', err);
            toastBody.textContent = 'Terjadi kesalahan saat menyimpan.';
            toastEl.classList.replace('text-bg-success', 'text-bg-danger');
            toast.show();
        }
    });

    // 🗑️ Konfirmasi Hapus
    btnKonfirmasiHapus?.addEventListener('click', () => {
        if (rowToDelete) {
            const { row } = rowToDelete;
            row.classList.add('pending-delete');
            row.dataset.pendingDelete = 'true';
            rowToDelete = null;
            bootstrap.Modal.getInstance(modalHapusEl)?.hide();
        }
    });
});

// ======================
// 💵 Modul Pembayaran
// ======================
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('paymentForm');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const transactionId = document.getElementById('paymentTransactionId').value;
            const amount = document.getElementById('paymentAmount').value;
            const method = document.getElementById('paymentMethod').value;

            const formData = new FormData();
            formData.append('sales_transaction_id', transactionId);
            formData.append('payment_amount', amount);
            formData.append('payment_method', method);

            try {
                const response = await fetch('/payment', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    toastSuccess(result.message || 'Pembayaran berhasil disimpan.');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPembayaran'));
                    if (modal) modal.hide();
                    setTimeout(() => location.reload(), 1000);
                } else {
                    toastError(result.error || 'Pembayaran gagal.');
                }

            } catch (err) {
                console.error('Fetch error:', err);
                toastError('Terjadi kesalahan saat mengirim data pembayaran.');
            }
        });
    }

    // 📊 Hitung Kembalian Dinamis
    const amountInput = document.getElementById('paymentAmount');
    const changeDisplay = document.getElementById('paymentChange');
    const meta = document.getElementById('payment-meta');

    const alreadyPaid = Number(meta?.dataset.totalDibayar || 0);
    const tagihan = Number(meta?.dataset.totalTagihan || 0);

    if (amountInput) {
        amountInput.addEventListener('input', () => {
            const tambahan = parseFloat(amountInput.value) || 0;
            const totalBayar = alreadyPaid + tambahan;
            const kembalian = totalBayar - tagihan;

            if (changeDisplay) {
                if (kembalian > 0) {
                    changeDisplay.textContent = `Rp ${kembalian.toLocaleString('id-ID')}`;
                    changeDisplay.classList.remove('text-muted', 'text-success');
                    changeDisplay.classList.add('text-danger');
                } else {
                    changeDisplay.textContent = `Rp 0`;
                    changeDisplay.classList.remove('text-danger');
                    changeDisplay.classList.add('text-muted');
                }
            }
        });
    }
});

// ======================
// Riwayat Pembayaran
// ======================

document.addEventListener('DOMContentLoaded', () => {
    const riwayatModal = document.getElementById('modalRiwayatPembayaran');

    if (riwayatModal) {
        riwayatModal.addEventListener('show.bs.modal', () => {
            const transactionId = document.getElementById('paymentTransactionId')?.value;
            if (transactionId) {
                loadRiwayatPembayaran(transactionId);
            }
        });
    }
});
document.addEventListener('click', async function (e) {
    if (!e.target.classList.contains('btn-hapus-payment')) return;

    const id = e.target.getAttribute('data-id');
    if (!id) {
        console.error('❌ Gagal: ID kosong.');
        return;
    }

    console.log('Menghapus pembayaran dengan ID:', id);

    const konfirmasi = confirm('Apakah yakin ingin menghapus pembayaran ini?');
    if (!konfirmasi) return;

    const transactionId = document.getElementById('paymentTransactionId')?.value;

    try {
        const res = await fetch('/payment/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sales_payment_id: id })
        });

        const result = await res.json();

        if (res.ok) {
            toastSuccess(result.message || 'Pembayaran berhasil dihapus.');

            if (transactionId) {
                // ✅ Reload halaman agar total_dibayar & status otomatis update
                setTimeout(() => {
                    window.location.href = `/details/${transactionId}`;
                }, 1000);
            }
        } else {
            toastError(result.error || 'Gagal menghapus pembayaran.');
        }

    } catch (err) {
        console.error('Gagal menghapus pembayaran:', err);
        toastError('Terjadi kesalahan pada server.');
    }
});

// ======================
// 🗑️ Modul Batalkan Perubahan Pesanan
// ======================
document.addEventListener('DOMContentLoaded', () => {
    const btnCancel = document.getElementById('btnCloseOrder');
    const transactionId = document.querySelector('input[name="sales_transaction_id"]')?.value;

    if (btnCancel && transactionId) {
        btnCancel.addEventListener('click', (e) => {
            e.preventDefault();
            const confirmCancel = confirm('Yakin ingin membatalkan semua perubahan pesanan?');
            if (confirmCancel) {
                window.location.href = `/details/${transactionId}`;
            }
        });
    }
});

// ======================
// 🖨️ Modul Cetak Struk
// ======================
document.addEventListener('DOMContentLoaded', function () {
    const btnOpenCetak = document.getElementById('btnOpenCetakNota');
    const btnCetakFinal = document.getElementById('btnCetakNotaFinal');
    const modalCetak = new bootstrap.Modal(document.getElementById('modalCetakNota'));
    const iframeNota = document.getElementById('notaPreviewFrame');
    const printerSelect = document.getElementById('printerSelect');
    const printerStatus = document.getElementById('printerStatus');

    // ✅ Ambil transactionId dari <script id="meta-detail">
    let transactionId = '';
    try {
        const meta = document.getElementById('meta-detail');
        const parsed = JSON.parse(meta.textContent);
        transactionId = parsed.transactionId;
    } catch (err) {
        console.error('❌ Gagal mengambil transaction ID dari #meta-detail');
        return;
    }

    // 🖨️ Saat tombol cetak diklik
    btnOpenCetak?.addEventListener('click', async () => {
        iframeNota.src = `/nota-preview/${transactionId}`;

        let defaultPrinter = null;

        // ⬅️ Ambil default printer dulu
        try {
            const res = await fetch('/printer-default');
            const data = await res.json();
            defaultPrinter = data.defaultPrinter || null;
            window._cachedDefaultPrinter = defaultPrinter;
            console.log('🖨️ Default printer:', defaultPrinter);
        } catch (err) {
            console.warn('❌ Gagal ambil default printer:', err);
        }

        // ⬇️ Ambil daftar printer
        try {
            const res = await fetch('/printer-list');
            const printers = await res.json();

            printerSelect.innerHTML = '';
            let foundDefault = false;

            if (!printers.length) {
                printerSelect.innerHTML = '<option disabled selected>Tidak ada printer terdeteksi</option>';
                printerStatus.textContent = '🔌 Periksa koneksi printer.';
            } else {
                printers.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.name;
                    opt.textContent = p.default ? `${p.name} (Default)` : p.name;

                    if (
                        defaultPrinter &&
                        p.name.trim().toLowerCase() === defaultPrinter.trim().toLowerCase()
                    ) {
                        opt.selected = true;
                        foundDefault = true;
                    }

                    printerSelect.appendChild(opt);
                });

                printerStatus.textContent = foundDefault
                    ? `🖨️ Printer default "${defaultPrinter}" siap digunakan.`
                    : defaultPrinter
                        ? `⚠️ Printer default "${defaultPrinter}" tidak ditemukan.`
                        : `🖨️ Silakan pilih printer.`;
            }
        } catch (err) {
            printerSelect.innerHTML = '<option disabled selected>Gagal mengambil daftar printer</option>';
            printerStatus.textContent = '❌ Tidak dapat menghubungi server printer.';
        }

        modalCetak.show();
    });


    // ✅ Tombol cetak final ditekan
    btnCetakFinal?.addEventListener('click', async () => {
        const printerName = printerSelect.value;
        if (!printerName) return alert('Silakan pilih printer terlebih dahulu.');

        // Simpan default printer jika dicentang
        await fetch('/printer-default', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ printerName })
        });

        // ✅ update variable lokal
        window._cachedDefaultPrinter = printerName;


        try {
            const res = await fetch(`/cetak-nota/${transactionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ printer: printerName })
            });

            const result = await res.json();

            if (res.ok) {
                alert(result.message || 'Nota berhasil dicetak.');
                modalCetak.hide();
                setTimeout(() => {
                    btnOpenCetak.click(); // buka ulang modal untuk refresh printer default
                }, 100);

            } else {
                alert(result.error || 'Gagal mencetak nota.');
            }
        } catch (err) {
            console.error('❌ Error saat cetak:', err);
            alert('Gagal mencetak. Mungkin kamu membatalkan dialog printer atau printer tidak tersedia.');
        }
    });

});
