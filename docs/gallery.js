(() => {
  const dialog = document.getElementById("gallery-story-dialog");

  if (!dialog) {
    return;
  }

  const dialogImage = dialog.querySelector(".gallery-story-dialog__image");
  const dialogLabel = dialog.querySelector(".gallery-story-dialog__label");
  const dialogTitle = dialog.querySelector("#gallery-story-title");
  const dialogSubtitle = dialog.querySelector(".gallery-story-dialog__subtitle");
  const dialogDetail = dialog.querySelector(".gallery-story-dialog__detail");
  const closeButton = dialog.querySelector(".gallery-story-dialog__close");
  let lastTrigger;

  function openStory(trigger) {
    const figure = trigger.closest(".scholar-gallery__item");
    const image = trigger.querySelector("img");

    lastTrigger = trigger;
    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = image.alt;
    dialogLabel.textContent = figure.querySelector(".scholar-gallery__label").textContent;
    dialogTitle.textContent = figure.querySelector("strong").textContent;
    dialogSubtitle.textContent = figure.querySelector(".scholar-gallery__subtitle").textContent;
    dialogDetail.textContent = figure.querySelector(".scholar-gallery__detail").textContent;
    dialog.showModal();
    closeButton.focus();
  }

  document.querySelectorAll(".gallery-story").forEach((trigger) => {
    trigger.addEventListener("click", () => openStory(trigger));
  });

  closeButton.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    if (lastTrigger) {
      lastTrigger.focus();
    }
  });
})();
