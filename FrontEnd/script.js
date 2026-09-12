const gallery = document.querySelector('.gallery');
const token = localStorage.getItem('token');
const editBanner = document.querySelector('.edit-banner');
const editProjects = document.querySelector('#edit-projects');
const loginLink = document.querySelector('#login-link');
const filters = document.querySelector('.filter-buttons');

// Affichage de secours : la page d'accueil reste complète si elle est ouverte
// directement et que l'API locale n'est pas disponible.
const fallbackCategories = [
  { id: 1, name: 'Objets' },
  { id: 2, name: 'Appartements' },
  { id: 3, name: 'Hôtels & restaurants' },
];

const fallbackWorks = [
  { title: 'Abajour Tahina', imageUrl: './assets/images/abajour-tahina.png', categoryId: 1 },
  { title: 'Appartement Paris V', imageUrl: './assets/images/appartement-paris-v.png', categoryId: 2 },
  { title: 'Restaurant Sushisen - Londres', imageUrl: './assets/images/restaurant-sushisen-londres.png', categoryId: 3 },
  { title: 'Villa La Balisiere', imageUrl: './assets/images/la-balisiere.png', categoryId: 3 },
  { title: 'Structures Thermopolis', imageUrl: './assets/images/structures-thermopolis.png', categoryId: 3 },
  { title: 'Appartement Paris X', imageUrl: './assets/images/appartement-paris-x.png', categoryId: 2 },
  { title: 'Pavillon Le Coteau', imageUrl: './assets/images/le-coteau-cassis.png', categoryId: 3 },
  { title: 'Villa Ferneze', imageUrl: './assets/images/villa-ferneze.png', categoryId: 3 },
  { title: 'Appartement Paris XVIII', imageUrl: './assets/images/appartement-paris-xviii.png', categoryId: 2 },
  { title: 'Bar Lullaby - Paris', imageUrl: './assets/images/bar-lullaby-paris.png', categoryId: 3 },
  { title: 'Hôtel First Arte - New Delhi', imageUrl: './assets/images/hotel-first-arte-new-delhi.png', categoryId: 3 },
];

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

function renderWorks(works) {
  const fragment = document.createDocumentFragment();

  works.forEach((work) => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    const caption = document.createElement('figcaption');

    image.src = work.imageUrl;
    image.alt = work.title;
    caption.textContent = work.title;

    figure.append(image, caption);
    fragment.append(figure);
  });

  gallery.replaceChildren(fragment);
}

function renderFilters(categories, works) {
  const fragment = document.createDocumentFragment();
  const allCategories = [{ id: 'all', name: 'Tous' }, ...categories];

  allCategories.forEach((category, index) => {
    const button = document.createElement('button');

    button.className = 'filter-button';
    button.type = 'button';
    button.dataset.category = category.id;
    button.textContent = category.name;
    button.classList.toggle('is-active', index === 0);

    button.addEventListener('click', () => {
      filters.querySelectorAll('.filter-button').forEach((item) => {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');

      const filteredWorks = category.id === 'all'
        ? works
        : works.filter((work) => work.categoryId === category.id);

      renderWorks(filteredWorks);
    });

    fragment.append(button);
  });

  filters.replaceChildren(fragment);
}

async function loadPortfolio() {
  try {
    const [worksResponse, categoriesResponse] = await Promise.all([
      fetch('http://localhost:5678/api/works'),
      fetch('http://localhost:5678/api/categories'),
    ]);

    if (!worksResponse.ok || !categoriesResponse.ok) {
      throw new Error('Les données du portfolio n’ont pas pu être récupérées.');
    }

    const [works, categories] = await Promise.all([
      worksResponse.json(),
      categoriesResponse.json(),
    ]);

    renderWorks(works);
    renderFilters(categories, works);
  } catch (error) {
    console.error('Impossible de charger le portfolio :', error);
    renderWorks(fallbackWorks);
    renderFilters(fallbackCategories, fallbackWorks);
  }
}

loadPortfolio();
