const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.gallery figure');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedCategory = button.dataset.category;

    filterButtons.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');

    projectCards.forEach((card) => {
      const shouldShow = selectedCategory === 'all' || card.dataset.category === selectedCategory;
      card.hidden = !shouldShow;
    });
  });
});
