// ✅ Delegasi tombol hapus
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('btn-delete')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Yakin ingin menghapus barang ini?')) {
                window.location.href = '/items/delete/' + id;
            }
        }
    });
});

// ✅ Validasi Form Tambah Barang
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('itemForm');
    const formAlert = document.getElementById('formAlert');
    const modalEl = document.getElementById('tambahBaru');

    if (form && formAlert && modalEl) {
        form.addEventListener('submit', function (e) {
            let isValid = true;

            const fieldIds = [
                'item_code',
                'item_type',
                'supplier_id',
                'stock_quantity',
                'purchase_price',
                'selling_price',
                'unit'
            ];
            const inputs = fieldIds.map(id => document.getElementById(id));

            // Reset class validasi
            inputs.forEach(i => i.classList.remove('is-invalid', 'is-valid'));
            formAlert.classList.add('d-none');

            inputs.forEach((input) => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.add('is-valid');
                }
            });

            if (!isValid) {
                e.preventDefault();
                formAlert.innerText = 'Semua field wajib diisi dengan benar!';
                formAlert.classList.remove('d-none');
            }
        });

        // Reset modal setelah ditutup
        modalEl.addEventListener('hidden.bs.modal', function () {
            form.classList.remove('was-validated');
            form.reset();
            [
                'item_code',
                'item_type',
                'supplier_id',
                'stock_quantity',
                'purchase_price',
                'selling_price',
                'unit'
            ].forEach(id => {
                const el = document.getElementById(id);
                el.classList.remove('is-invalid', 'is-valid');
            });
            formAlert.classList.add('d-none');
        });
    }
});

// ✅ Tooltip Bootstrap
document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// ✅ Search + Limit + Pagination (modular & efisien)
document.addEventListener('DOMContentLoaded', function () {
    const itemsTableContainer = document.getElementById('itemsTableContainer');
    let isLoading = false;

    function fetchItems(search, limit, page) {
        if (isLoading) return;
        isLoading = true;

        fetch(`/items/data?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => response.text())
            .then(html => {
                itemsTableContainer.innerHTML = html;
            })
            .catch(error => console.error('Error fetching items:', error))
            .finally(() => {
                isLoading = false;
            });
    }

    function updateItemList(page = 1) {
        const search = document.getElementById('searchInput').value.trim();
        const limit = document.getElementById('limitSelect').value;
        fetchItems(search, limit, page);
    }

    // Search & Limit
    ['searchInput', 'limitSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => updateItemList());
    });

    // Pagination
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link') && e.target.dataset.page) {
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) updateItemList(page);
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('tambahBaru');

    if (modal) {
        modal.addEventListener('shown.bs.modal', function () {
            const $select = $('#supplier_id');
            if (!$select.hasClass("select2-hidden-accessible")) {
                $select.select2({
                    dropdownParent: $('#tambahBaru'),
                    placeholder: 'Pilih supplier...',
                    allowClear: true,
                    width: '100%'
                });
            }
        });
    }
});
