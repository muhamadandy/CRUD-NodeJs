document.addEventListener("DOMContentLoaded", function () {
  const toggleSidebarButton = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("close-sidebar");

  //button hamburger
  toggleSidebarButton.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });

  //button close sidebar
  closeSidebar.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full");
  });

  //validation message
  setTimeout(() => {
    document.getElementById("validation-message").remove();
  }, 5000);
});
