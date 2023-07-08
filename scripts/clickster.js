/* Clicky */

function clickster() {
  document.querySelectorAll("[data-clicky]").forEach((clickyEl) => {
    const target = document.querySelector(clickyEl.dataset.clicky);
    clickyEl.addEventListener("click", (e) => {
      target.click(e);
    });
  });
}

export default clickster;
