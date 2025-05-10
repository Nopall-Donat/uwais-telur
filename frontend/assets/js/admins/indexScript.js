// ✅ Validasi Form Tambah Admin
document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('adminForm');
    const btnSubmitAdd = document.getElementById('btnSubmitAddAdmin');
    const modal = new bootstrap.Modal(document.getElementById('modalKonfirmasiPasswordGlobal'));
    const confirmInput = document.getElementById('globalConfirmPassword');
    const errorFeedback = document.getElementById('globalConfirmPasswordError');
    const confirmHiddenInput = document.getElementById('confirm_password_hidden');

    if (addForm && btnSubmitAdd) {
        btnSubmitAdd.addEventListener('click', () => {
            // Validasi dulu
            let isValid = true;
            const name = document.getElementById('admin_name');
            const user = document.getElementById('username');
            const pass = document.getElementById('password');
            const confirm = document.getElementById('confirm_password');

            [name, user, pass, confirm].forEach(el => el.classList.remove('is-invalid'));

            if (!name.value.trim()) {
                name.classList.add('is-invalid');
                isValid = false;
            }
            if (!user.value.trim()) {
                user.classList.add('is-invalid');
                isValid = false;
            }
            if (!pass.value.trim()) {
                pass.classList.add('is-invalid');
                isValid = false;
            }
            if (confirm.value !== pass.value) {
                confirm.classList.add('is-invalid');
                isValid = false;
            }

            if (!isValid) return;

            bootstrap.Modal.getInstance(document.getElementById('modalTambahAdmin'))?.hide();
            // Show modal konfirmasi password
            confirmInput.value = '';
            errorFeedback.classList.add('d-none');
            modal.show();
        });

        // Saat klik tombol konfirmasi password
        document.getElementById('btnGlobalKonfirmasi')?.addEventListener('click', () => {
            const pwd = confirmInput.value.trim();
            if (!pwd) {
                errorFeedback.classList.remove('d-none');
                return;
            }
            confirmHiddenInput.value = pwd;
            modal.hide();
            addForm.submit();
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
    const btnSubmit = document.getElementById('btnSubmitUpdateAdmin');
    const modalEl = document.getElementById('modalKonfirmasiPassword');
    const confirmInput = document.getElementById('confirmCurrentPassword');
    const hiddenConfirm = document.getElementById('confirm_password_hidden');
    const errorFeedback = document.getElementById('confirmPasswordError');

    if (form && btnSubmit && modalEl && confirmInput && hiddenConfirm) {
        const modal = new bootstrap.Modal(modalEl);

        btnSubmit.addEventListener('click', function () {
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
            // Saat user submit melalui modal konfirmasi
            hiddenConfirm.value = confirmInput.value.trim(); // string dikirim ke input hidden
            modal.hide();
            form.submit();
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const modal = new bootstrap.Modal(document.getElementById('modalKonfirmasiPasswordGlobal'));
    const confirmBtn = document.getElementById('btnGlobalKonfirmasi');
    const confirmInput = document.getElementById('globalConfirmPassword');
    const errorFeedback = document.getElementById('globalConfirmPasswordError');
    const hiddenInput = document.getElementById('globalConfirmHiddenInput');
    const deleteForm = document.getElementById('adminDeleteForm');

    let pendingAction = null;
    let pendingId = null;

    document.body.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-delete')) {
            pendingAction = 'delete';
            pendingId = e.target.dataset.id;
            confirmInput.value = '';
            errorFeedback.classList.add('d-none');
            modal.show();
        }
    });

    confirmBtn.addEventListener('click', function () {
        const pwd = confirmInput.value.trim();
        if (!pwd) {
            errorFeedback.classList.remove('d-none');
            return;
        }
        hiddenInput.value = pwd;

        if (pendingAction === 'delete') {
            deleteForm.setAttribute('action', `/admins/delete/${pendingId}`);
            deleteForm.submit();
        }

        modal.hide();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.password-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const targetId = icon.getAttribute('data-target');
            const input = document.getElementById(targetId);

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            } else {
                input.type = 'password';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            }
        });
    });
});