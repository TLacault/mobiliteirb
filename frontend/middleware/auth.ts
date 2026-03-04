/**
 * Middleware d'authentification pour Nuxt 3
 *
 * Protège les routes qui nécessitent une authentification.
 * Si l'utilisateur n'est pas connecté, il est redirigé vers /connexion
 *
 * Usage:
 * Dans une page, ajoutez :
 * definePageMeta({
 *   middleware: 'auth'
 * })
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Ne pas exécuter côté serveur
  if (process.server) return;

  const { isAuthenticated } = useAuth();

  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated.value) {
    // Sauvegarder l'URL de destination pour y revenir après connexion
    if (to.path !== "/connexion") {
      sessionStorage.setItem("redirect_after_login", to.fullPath);
    }

    // Rediriger vers la page de connexion
    return navigateTo("/connexion");
  }
});
