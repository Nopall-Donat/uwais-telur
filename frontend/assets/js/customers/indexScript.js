// ✅ Delegasi tombol hapus
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('btn-delete')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Yakin ingin menghapus pelanggan ini?')) {
                window.location.href = '/customers/delete/' + id;
            }
        }
    });
});

// ✅ Validasi Form Tambah Pelanggan
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('customerForm');
    const formAlert = document.getElementById('formAlert');
    const modalEl = document.getElementById('tambahBaru');

    if (form && formAlert && modalEl) {
        form.addEventListener('submit', function (e) {
            let isValid = true;
            const inputs = ['name', 'phone_number', 'address'].map(id => document.getElementById(id));

            inputs.forEach(i => {
                i.classList.remove('is-invalid', 'is-valid');
            });
            formAlert.classList.add('d-none');

            const [nameInput, phoneInput, addressInput] = inputs;

            if (!nameInput.value.trim()) {
                nameInput.classList.add('is-invalid');
                isValid = false;
            } else {
                nameInput.classList.add('is-valid');
            }

            const phoneVal = phoneInput.value.trim();
            if (phoneVal && !/^\d{10,13}$/.test(phoneVal)) {
                phoneInput.classList.add('is-invalid');
                isValid = false;
            } else {
                phoneInput.classList.add('is-valid');
            }

            if (!addressInput.value.trim()) {
                addressInput.classList.add('is-invalid');
                isValid = false;
            } else {
                addressInput.classList.add('is-valid');
            }

            if (!isValid) {
                e.preventDefault();
                formAlert.innerText = 'Nama dan alamat wajib diisi. Nomor HP opsional, tapi harus 10-13 digit jika diisi.';
                formAlert.classList.remove('d-none');
            }
        });

        // Reset modal setelah ditutup
        modalEl.addEventListener('hidden.bs.modal', function () {
            form.classList.remove('was-validated');
            form.reset();
            ['name', 'phone_number', 'address'].forEach(id => {
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
    const customersTableContainer = document.getElementById('customersTableContainer');
    let isLoading = false;

    function fetchCustomers(search, limit, page) {
        if (isLoading) return;
        isLoading = true;

        fetch(`/customers/data?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => response.text())
            .then(html => {
                customersTableContainer.innerHTML = html;
            })
            .catch(error => console.error('Error fetching customers:', error))
            .finally(() => {
                isLoading = false;
            });
    }

    function updateCustomerList(page = 1) {
        const search = document.getElementById('searchInput').value.trim();
        const limit = document.getElementById('limitSelect').value;
        fetchCustomers(search, limit, page);
    }

    // Search & Limit
    ['searchInput', 'limitSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => updateCustomerList());
    });

    // Pagination
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link') && e.target.dataset.page) {
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) updateCustomerList(page);
        }
    });
});