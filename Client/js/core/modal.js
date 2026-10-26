/** Small helpers for the existing .modal-backdrop / .show modal pattern. */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('show');
  modal.querySelector('input, textarea, select, button.btn-primary')?.focus?.();
}

export function closeModal(id) {
  document.getElementById(id)?.classList.remove('show');
}

/** Wires every [data-close-modal] control, backdrop clicks and Escape for the modals on the page. */
export function bindModalDismissal() {
  document.querySelectorAll('[data-close-modal]').forEach(control => {
    control.addEventListener('click', () => closeModal(control.dataset.closeModal));
  });
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('mousedown', event => {
      if (event.target === backdrop) backdrop.classList.remove('show');
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
  });
}
