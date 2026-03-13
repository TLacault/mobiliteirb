// @ts-nocheck

export default defineNuxtPlugin((nuxtApp) => {
  if (!window.IntersectionObserver) {
    return;
  }

  const seen = new WeakSet<Element>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        const revealOnce = element.dataset.revealOnce !== "false";

        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          if (revealOnce) {
            observer.unobserve(element);
          }
          return;
        }

        if (!revealOnce) {
          element.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  const registerRevealElements = () => {
    document
      .querySelectorAll<HTMLElement>(".reveal-on-scroll")
      .forEach((el) => {
        if (seen.has(el)) {
          return;
        }
        seen.add(el);
        observer.observe(el);
      });
  };

  nuxtApp.hook("page:finish", () => {
    requestAnimationFrame(registerRevealElements);
  });

  const mutationObserver = new MutationObserver(() => {
    registerRevealElements();
  });

  registerRevealElements();

  if (document.body) {
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
});
