// ======================
// 🔁 Modal Toggle (Pilih ↔ Tambah Pelanggan)
// ======================
document.addEventListener('DOMContentLoaded', () => {
    const btnTambah = document.getElementById('btnTambahPelanggan');
    const modalPilih = document.getElementById('modalPilihPelanggan');
    const modalTambahEl = document.getElementById('modalTambahPelanggan');

    if (btnTambah && modalPilih && modalTambahEl) {
        const modalTambahInstance = new bootstrap.Modal(modalTambahEl);
        btnTambah.addEventListener('click', () => {
            const modalPilihInstance = bootstrap.Modal.getInstance(modalPilih);
            if (modalPilihInstance) modalPilihInstance.hide();
            setTimeout(() => {
                modalTambahInstance.show();
                modalTambahEl.addEventListener('shown.bs.modal', () => {
                    document.getElementById('name')?.focus();
                }, { once: true });
            }, 300);
        });
    }
});

// ======================
// ✅ Validasi Modal Tambah Pelanggan
// ======================
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('customerForm');
    const formAlert = document.getElementById('formAlert');
    const modalEl = document.getElementById('modalTambahPelanggan');
    if (form && formAlert && modalEl) {
        form.addEventListener('submit', function (e) {
            let isValid = true;
            const inputs = ['name', 'phone_number', 'address'].map(id => document.getElementById(id));
            inputs.forEach(i => i.classList.remove('is-invalid', 'is-valid'));
            formAlert.classList.add('d-none');

            const [nameInput, phoneInput, addressInput] = inputs;

            if (!nameInput.value.trim()) {
                nameInput.classList.add('is-invalid');
                isValid = false;
            } else nameInput.classList.add('is-valid');

            const phoneVal = phoneInput.value.trim();
            if (!/^\d{10,13}$/.test(phoneVal)) {
                phoneInput.classList.add('is-invalid');
                isValid = false;
            } else phoneInput.classList.add('is-valid');

            if (!addressInput.value.trim()) {
                addressInput.classList.add('is-invalid');
                isValid = false;
            } else addressInput.classList.add('is-valid');

            if (!isValid) {
                e.preventDefault();
                formAlert.innerText = 'Semua field wajib diisi dengan benar!';
                formAlert.classList.remove('d-none');
            }
        });

        modalEl.addEventListener('hidden.bs.modal', function () {
            form.reset();
            formAlert.classList.add('d-none');
            ['name', 'phone_number', 'address'].forEach(id => {
                const el = document.getElementById(id);
                el.classList.remove('is-invalid', 'is-valid');
            });
        });
    }
});

// ======================
// 📌 Inisialisasi Select2
// ======================
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modalPilihPelanggan');
    if (modal) {
        modal.addEventListener('shown.bs.modal', function () {
            const $select = $('#customer_id');
            if (!$select.hasClass("select2-hidden-accessible")) {
                $select.select2({
                    dropdownParent: $('#modalPilihPelanggan'),
                    placeholder: 'Pilih pelanggan...',
                    allowClear: true,
                    width: '100%'
                });
            }
        });
    }
});

// ======================
// 🧠 Tooltip
// ======================
document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (el) {
        new bootstrap.Tooltip(el, {
            trigger: 'hover focus',
            container: 'body'
        });
    });
});

// ======================
// 🔍 Fetch Sales Data (index)
// ======================
document.addEventListener('DOMContentLoaded', () => {
    const salesTableContainer = document.getElementById('salesTableContainer');
    if (!salesTableContainer) return;

    const searchInput = document.getElementById('searchInput');
    const limitSelect = document.getElementById('limitSelect');

    function fetchSales(search, limit, page) {
        fetch(`/data?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => response.text())
            .then(html => { salesTableContainer.innerHTML = html; })
            .catch(err => console.error('Error fetching sales:', err));
    }

    [searchInput, limitSelect].forEach(el => {
        if (el) {
            el.addEventListener('input', () => {
                fetchSales(searchInput.value, limitSelect.value, 1);
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link') && e.target.dataset.page) {
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) {
                fetchSales(searchInput.value, limitSelect.value, page);
            }
        }
    });
});

// ======================
// Backup Database
// ======================
document.addEventListener('DOMContentLoaded', () => {
    const btnExport = document.getElementById('btnExportExcel');
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            window.location.href = '/backup'; // langsung download
        });
    }
});