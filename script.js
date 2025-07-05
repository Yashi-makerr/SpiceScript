  const icons = document.querySelectorAll('.section-1-icons i');
    let i = 1;
    setInterval(() => {
      i++;
      const icon = document.querySelector('.section-1-icons i.change');
      icon.classList.remove('change');
      if (i > icons.length) {
        icons[0].classList.add('change');
        i = 1;
      } else {
        icon.nextElementSibling.classList.add('change');
      }
    }, 1000);

    // Toggle navbar
    const menu = document.querySelector('.menu');
    const navbar = document.querySelector('.navbar');

    menu.addEventListener('click', () => {
      menu.classList.toggle('change');
      navbar.classList.toggle('change');
    });