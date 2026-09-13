// --- Sélection des éléments de la modale 1 --- //
const modal1 = document.querySelector('#gallery-modal'); //
const opnModalbtn = document.querySelector('#edit-projects'); //
const closeModalBtn1 = modal1.querySelector('.modal-close'); //[cite: 3]

// --- Fonction pour ouvrir la modale 1 --- //
function openModal() {
  modal1.style.display = 'flex'; // ou 'block' selon ton CSS
  document.body.style.overflow = 'hidden'; 
}

// --- Fonction pour fermer la modale 1 --- //
function closeModal() {
  modal1.style.display = 'none';
  document.body.style.overflow = ''; 
}

closeModalBtn1.addEventListener('click', (event) => {
  event.preventDefault();
  closeModal();
});

modal1.addEventListener('click', (event) => {
  if (event.target === modal1) {
    closeModal();
  }
});

opnModalbtn.addEventListener('click', (event) => {
  event.preventDefault();
  openModal();
});

// --- Sélection des éléments pour la modale 2 --- //
const modal2 = document.querySelector('#add-photo-modal'); //[cite: 3]
const addphotoBtn = document.querySelector('#gallery-modal .modal-actions a'); //[cite: 3]
const closeModalBtn2 = modal2.querySelector('.modal-close'); //[cite: 3]
const backarrowBtn = modal2.querySelector('.modal-back'); //[cite: 3]

// --- Fonction pour ouvrir la modale 2 --- //
function openModal2() {
  modal2.style.display = 'flex';
  document.body.style.overflow = 'hidden'; 
}

// --- Fonction pour fermer la modale 2 --- //
function closeModal2() {
  modal2.style.display = 'none';
  document.body.style.overflow = ''; 
}

// --- Événements modale 2 --- //
if (addphotoBtn) {
  addphotoBtn.addEventListener('click', (event) => {
    event.preventDefault();
    closeModal(); 
    openModal2(); 
  });
}

closeModalBtn2.addEventListener('click', (event) => {
  event.preventDefault();
  closeModal2();
});

modal2.addEventListener('click', (event) => {
  if (event.target === modal2) {
    closeModal2();
  }
});

// --- Retour à la galerie via la flèche --- //
if (backarrowBtn) {
  backarrowBtn.addEventListener('click', (event) => {
    event.preventDefault();
    closeModal2();
    openModal();
  });
}

// --- Prévisualisation de l'image --- //
const imageUpload = document.querySelector('#photo-file'); //[cite: 3]
const previewImage = document.querySelector('.upload-preview'); //[cite: 3]

console.log("Élément input trouvé :", imageUpload);
console.log("Élément image trouvé :", previewImage);

if (imageUpload) {
  imageUpload.addEventListener('change', (event) => {
    console.log("Un fichier a bien été sélectionné !");
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("Fichier lu par le FileReader avec succès.");
      if (previewImage) {
        previewImage.src = e.target.result;
        previewImage.removeAttribute('hidden');
        console.log("Attribut hidden retiré de l'image.");
      } else {
        console.error("Erreur : previewImage est introuvable !");
      }
    };
    reader.readAsDataURL(file);
  });
} else {
  console.error("Erreur : imageUpload est introuvable !");
}

