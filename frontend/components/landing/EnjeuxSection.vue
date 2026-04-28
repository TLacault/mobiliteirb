<template>
  <nav class="nav-enjeux"></nav>

  <!--Un conteneur parent qui centre tout au milieu de l'écran.-->
  <div class="section-enjeux container">
    <!--Un titre avec une icône d'alerte.-->
    <div class="title-container reveal-on-scroll reveal-up">
      <TriangleAlert :size="40" color="var(--primary)" />
      <h2 class="section-title gradient-cta">Les Enjeux</h2>
    </div>

    <!--Une zone flexible (Flexbox) contenant 3 colonnes identiques.-->
    <div class="flex-container">
      <!--Chaque colonne est divisée en deux : à gauche l'icône (le triangle), à droite le texte.-->
      <div class="column reveal-on-scroll reveal-up delay-1">
        <!--Colone 1-->
        <div class="icon-triangle">
          <Car color="var(--background)" />
        </div>

        <div class="text-content">
          <span class="stat-number">34%</span>
          <p class="stat-desc">
            des émissions de CO2 proviennent du secteur des transports
          </p>
        </div>
      </div>

      <div class="column reveal-on-scroll reveal-up delay-2">
        <!--Colone 2-->
        <div class="icon-triangle">
          <Cloudy color="var(--background)" centered />
        </div>

        <div class="text-content">
          <span class="stat-number">9 tonnes</span>
          <p class="stat-desc">
            d'émissions moyennes par individus en France chaque année
          </p>
        </div>
      </div>

      <div class="column reveal-on-scroll reveal-up delay-3">
        <!--Colone 3-->
        <div class="icon-triangle">
          <Goal color="var(--background)" />
        </div>

        <div class="text-content">
          <span class="stat-number">-55%</span>
          <p class="stat-desc">
            de réduction de ces émissions d'ici 2030 pour limiter le
            réchauffement
          </p>
        </div>
      </div>
    </div>

    <!--Un pied de page arrondi pour la source-->
    <div class="source-bar reveal-on-scroll reveal-up delay-4">
      <Info color="var(--primary)" size="20" />
      <span>
        Toutes les données proviennent de sources vérifiées<a
          href="https://ecologie.gouv.fr"
          >ecologie.gouv.fr</a
        ></span
      >
    </div>
  </div>
</template>

<style scoped>
/* 1. Le fond et le centrage global */
.section-enjeux {
  padding: 80px 20px;
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 2. Le Titre */
.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 50px;
}

/* 3. Les 3 colonnes */
.flex-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
  max-width: 1100px;
  margin-bottom: 60px;
}

/* 4. Style des Colonnes */
.column {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  min-width: 280px;
}

/* 5. Le triangle  */
.icon-triangle {
  background-image: url("/images/triangle_shape.webp");
  background-size: contain;
  background-repeat: no-repeat;
  padding-top: 16px;
  width: 70px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

/* 6. Typographie des stats */
.text-content {
  text-align: left;
}

.stat-number {
  display: block;
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
  color: #334155;
}

/* 7. La barre de source */
.source-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--primary);
  background-color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
}

.source-bar span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-bar a {
  text-decoration: none;
  color: var(--primary);
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 640px) {
  .section-enjeux {
    padding: 50px 1.5rem;
  }

  .title-container {
    margin-bottom: 32px;
  }

  .flex-container {
    gap: 24px;
  }

  .source-bar {
    align-items: flex-start;
    border-radius: 16px;
    padding: 0.65rem 1rem;
    font-size: 0.78rem;
    line-height: 1.45;
  }

  .source-bar span {
    display: inline;
  }

  .source-bar a {
    margin-left: 4px;
  }
}
</style>

<script setup>
import { TriangleAlert, Car, Cloudy, Goal, Info } from "lucide-vue-next";

useHead({
  title: "EnjeuxSection",
});
</script>
