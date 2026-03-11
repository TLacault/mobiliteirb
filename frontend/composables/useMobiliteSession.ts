/**
 * Composable pour persister l'état de la session d'édition de mobilité.
 * useState de Nuxt garantit que l'état est partagé entre les navigations.
 */
export const useMobiliteSession = () => {
  // UUID de la mobilité actuellement sélectionnée (null si aucune)
  const selectedUuid = useState<string | null>(
    "mobilite-selected-uuid",
    () => null,
  );

  // Dernier onglet actif pour chaque UUID
  const lastTab = useState<Record<string, "synthese" | "trajets">>(
    "mobilite-last-tab",
    () => ({}),
  );

  /**
   * Sélectionne une mobilité et entre en mode édition.
   * Réinitialise l'onglet actif sur "synthese" si c'est une nouvelle mobilité.
   */
  const selectMobilite = (uuid: string) => {
    if (selectedUuid.value !== uuid) {
      lastTab.value = { ...lastTab.value, [uuid]: "synthese" };
    }
    selectedUuid.value = uuid;
  };

  /**
   * Sort du mode édition et revient à la sélection.
   */
  const clearMobilite = () => {
    selectedUuid.value = null;
  };

  /**
   * Mémorise l'onglet actif pour une mobilité.
   */
  const setLastTab = (uuid: string, tab: "synthese" | "trajets") => {
    lastTab.value = { ...lastTab.value, [uuid]: tab };
  };

  /**
   * Retourne le dernier onglet actif pour une mobilité (synthese par défaut).
   */
  const getLastTab = (uuid: string): "synthese" | "trajets" => {
    return lastTab.value[uuid] ?? "synthese";
  };

  return {
    selectedUuid,
    lastTab,
    selectMobilite,
    clearMobilite,
    setLastTab,
    getLastTab,
  };
};
