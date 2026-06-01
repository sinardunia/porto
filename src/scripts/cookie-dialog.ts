function initCookieDialog() {
  const isAcceptCookie = localStorage.getItem("acceptCookie") === "true";
  if (isAcceptCookie) return;

  const template = document.getElementById("cookie-template") as HTMLTemplateElement | null;
  if (!template) return;

  if (document.getElementById("cookie-dialog")) return;

  const clone = document.importNode(template.content, true);
  document.body.appendChild(clone);

  const cookieDialog = document.getElementById("cookie-dialog");
  const acceptCookie = cookieDialog?.querySelector("button");

  setTimeout(() => {
    cookieDialog?.classList.remove("translate-x-full");
    cookieDialog?.classList.add("translate-x-0", "opacity-100");

    acceptCookie?.addEventListener("click", () => {
      cookieDialog?.classList.remove("translate-x-0", "opacity-100");
      cookieDialog?.classList.add("translate-x-full", "opacity-0");
      setTimeout(() => {
        cookieDialog?.remove();
        localStorage.setItem("acceptCookie", "true");
      }, 500);
    });
  }, 2000);
}

document.addEventListener("DOMContentLoaded", initCookieDialog);
document.addEventListener("astro:page-load", initCookieDialog);
