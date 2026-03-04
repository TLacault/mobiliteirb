/**
 * Plugin d'initialisation de l'authentification (client-side uniquement)
 *
 * Les plugins Nuxt s'exécutent AVANT les middlewares de route.
 * Cela garantit que checkAuth() restaure la session depuis localStorage
 * avant que le middleware 'auth' ne vérifie isAuthenticated.
 */
export default defineNuxtPlugin(async () => {
  const { checkAuth } = useAuth();
  await checkAuth();
});
