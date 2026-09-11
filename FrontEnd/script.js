function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.src="./assets/images/abajour-tahina.png";
    img.alt="Abajour Tahina";
    figcaption.textContent="Abajour Tahina";

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure); 
}
displayWorks(works);
