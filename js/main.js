document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card .start').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.closest('.card').dataset.key;
      location.href = `./tests/${key}.html`;
    });
  });
  document.querySelectorAll('.test-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      location.href = `./tests/${chip.dataset.link}.html`;
    });
  });
  const startAll = document.getElementById('startAll');
  if (startAll) startAll.addEventListener('click', () => {
    const main = document.querySelector('main');
    if (main) window.scrollTo({ top: main.offsetTop - 10, behavior: 'smooth' });
  });
});