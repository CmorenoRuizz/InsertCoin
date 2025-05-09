const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
  || window.innerWidth < 768;

if (isMobile) {
  document.getElementById('aviso-movil').classList.remove('d-none');

  document.getElementById('cerrar-aviso').addEventListener('click', () => {
    document.getElementById('aviso-movil').remove();
  });
}
