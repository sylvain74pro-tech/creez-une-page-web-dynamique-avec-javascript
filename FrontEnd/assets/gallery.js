/* Interactions de la galerie : ce fichier est le seul JavaScript du projet. */
(function () {
  const form = document.querySelector('.add-photo-form');
  const fileInput = document.querySelector('#photo-file');
  const titleInput = document.querySelector('#photo-title');
  const categoryInput = document.querySelector('#photo-category');
  const submitButton = form.querySelector('button[type="submit"]');
  const preview = document.querySelector('.upload-preview');
  const projectGallery = document.querySelector('.gallery');
  const modalGallery = document.querySelector('.modal-gallery');
  let previewUrl = '';

  function canSubmit() {
    return fileInput.files.length > 0 && titleInput.value.trim() !== '' && categoryInput.value !== '';
  }

  function updateSubmitState() {
    submitButton.disabled = !canSubmit();
  }

  function addDeleteButton(figure) {
    const removeButton = figure.querySelector('button');
    removeButton.addEventListener('click', function () {
      const index = Array.from(modalGallery.children).indexOf(figure);
      figure.remove();
      if (projectGallery.children[index]) projectGallery.children[index].remove();
    });
  }

  fileInput.addEventListener('change', function () {
    const file = fileInput.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 4 * 1024 * 1024) {
      fileInput.value = '';
      preview.hidden = true;
      alert('Choisissez une image JPG ou PNG de 4 Mo maximum.');
      updateSubmitState();
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
    preview.hidden = false;
    updateSubmitState();
  });

  titleInput.addEventListener('input', updateSubmitState);
  categoryInput.addEventListener('change', updateSubmitState);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!canSubmit()) return;

    const title = titleInput.value.trim();
    const imageUrl = preview.src;
    const projectFigure = document.createElement('figure');
    const projectImage = document.createElement('img');
    const caption = document.createElement('figcaption');
    projectImage.src = imageUrl;
    projectImage.alt = title;
    caption.textContent = title;
    projectFigure.append(projectImage, caption);
    projectGallery.append(projectFigure);

    const modalFigure = document.createElement('figure');
    const modalImage = document.createElement('img');
    const removeButton = document.createElement('button');
    modalImage.src = imageUrl;
    modalImage.alt = title;
    removeButton.type = 'button';
    removeButton.textContent = '▣';
    removeButton.setAttribute('aria-label', `Supprimer ${title}`);
    modalFigure.append(modalImage, removeButton);
    modalGallery.append(modalFigure);
    addDeleteButton(modalFigure);

    form.reset();
    preview.hidden = true;
    preview.removeAttribute('src');
    previewUrl = '';
    updateSubmitState();
    window.location.hash = 'gallery-modal';
  });

  modalGallery.querySelectorAll('figure').forEach(addDeleteButton);
  updateSubmitState();
})();
