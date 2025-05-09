// ✅ Delegasi tombol hapus admin
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('btn-delete')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Yakin ingin menghapus admin ini?')) {
                // Gunakan method POST dengan form tersembunyi atau konfirmasi password di detail view
                window.location.href = '/admins/delete/' + id;
            }
        }
    });
});

// ✅ Validasi Form Tambah Admin
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('adminForm');
    const formAlert = document.getElementById('formAlert');
    const modalEl = document.getElementById('modalTambahAdmin');

    if (form && formAlert && modalEl) {
        form.addEventListener('submit', function (e) {
            let isValid = true;
            const fields = ['admin_name', 'username', 'password', 'confirm_password'];
            const inputs = fields.map(id => document.getElementById(id));

            inputs.forEach(i => {
                i.classList.remove('is-invalid', 'is-valid');
            });
            formAlert.classList.add('d-none');

            const [nameInput, usernameInput, passInput, confirmInput] = inputs;

            if (!nameInput.value.trim()) {
                nameInput.classList.add('is-invalid');
                isValid = false;
            } else {
                nameInput.classList.add('is-valid');
            }

            if (!usernameInput.value.trim()) {
                usernameInput.classList.add('is-invalid');
                isValid = false;
            } else {
                usernameInput.classList.add('is-valid');
            }

            if (!passInput.value.trim()) {
                passInput.classList.add('is-invalid');
                isValid = false;
            } else {
                passInput.classList.add('is-valid');
            }

            if (confirmInput.value.trim() !== passInput.value.trim()) {
                confirmInput.classList.add('is-invalid');
                isValid = false;
            } else {
                confirmInput.classList.add('is-valid');
            }

            if (!isValid) {
                e.preventDefault();
                formAlert.innerText = 'Semua field wajib diisi dengan benar!';
                formAlert.classList.remove('d-none');
            }
        });

        modalEl.addEventListener('hidden.bs.modal', function () {
            form.classList.remove('was-validated');
            form.reset();
            ['admin_name', 'username', 'password', 'confirm_password'].forEach(id => {
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

// ✅ Search + Limit + Pagination AJAX
document.addEventListener('DOMContentLoaded', function () {
    const adminsTableContainer = document.getElementById('adminsTableContainer');
    let isLoading = false;

    function fetchAdmins(search, limit, page) {
        if (isLoading) return;
        isLoading = true;

        fetch(`/admins/data?search=${encodeURIComponent(search)}&limit=${limit}&page=${page}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(response => response.text())
            .then(html => {
                adminsTableContainer.innerHTML = html;
            })
            .catch(error => console.error('Error fetching admins:', error))
            .finally(() => {
                isLoading = false;
            });
    }

    function updateAdminList(page = 1) {
        const search = document.getElementById('searchInput').value.trim();
        const limit = document.getElementById('limitSelect').value;
        fetchAdmins(search, limit, page);
    }

    ['searchInput', 'limitSelect'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => updateAdminList());
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-link') && e.target.dataset.page) {
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) updateAdminList(page);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adminUpdateForm');
    const modal = new bootstrap.Modal(document.getElementById('modalKonfirmasiPassword'));
    const btnSubmit = form.querySelector('button[type="submit"]');
    const confirmInput = document.getElementById('confirmCurrentPassword');
    const hiddenConfirm = document.getElementById('confirm_password_hidden');
    const errorFeedback = document.getElementById('confirmPasswordError');

    if (form && btnSubmit && modal && confirmInput && hiddenConfirm) {
        btnSubmit.addEventListener('click', function (e) {
            e.preventDefault();
            confirmInput.value = '';
            errorFeedback.classList.add('d-none');
            modal.show();
        });

        document.getElementById('btnKonfirmasiPassword').addEventListener('click', function () {
            const val = confirmInput.value.trim();
            if (!val) {
                errorFeedback.classList.remove('d-none');
                return;
            }
            hiddenConfirm.value = val;
            modal.hide();
            form.submit();
        });
    }
});
