const pairs = {
  orange: {before: 'IMG_8675.webp', after: 'IMG_8711.webp', name: 'On Cloud naranjas'},
  white: {before: 'IMG_8686.webp', after: 'IMG_8723.webp', name: 'On blancos'},
  alo: {before: 'IMG_8670.webp', after: 'IMG_8716.webp', name: 'Par blanco'}
};
document.querySelectorAll('[data-pair]').forEach(button => {
  button.addEventListener('click', () => {
    const pair = pairs[button.dataset.pair];
    document.querySelectorAll('[data-pair]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    for (const [id, label] of [['before', 'antes'], ['after', 'después']]) {
      const img = document.getElementById(id);
      img.src = 'assets/' + pair[id];
      img.alt = pair.name + ' ' + label + ' del lavado';
    }
  });
});
