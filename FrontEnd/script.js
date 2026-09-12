const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.gallery figure');
const token = localStorage.getItem('token');
const editBanner = document.querySelector('.edit-banner');
const editProjects = document.querySelector('#edit-projects');
const loginLink = document.querySelector('#login-link');
const filters = document.querySelector('.filter-buttons');

if (token) {
  editBanner.hidden = false;
  editProjects.hidden = false;
  filters.hidden = true;
  loginLink.textContent = 'logout';
  loginLink.href = '#';

  loginLink.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.reload();
  });
}

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
