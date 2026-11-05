document.querySelectorAll(".menuToggle").forEach((button) => {
  const menu = button.parentElement.querySelector(".menu");
  if (!menu) return;

  button.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    button.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
});
