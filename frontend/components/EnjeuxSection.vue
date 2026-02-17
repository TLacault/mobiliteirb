<template>

    <nav class="nav-enjeux"></nav>

    <!--Un conteneur parent qui centre tout au milieu de l'écran.-->
    <div class="section-enjeux">

        <!--Un titre avec une icône d'alerte.-->
        <div class="titre-container">
            <span class="icon-warning">
                <TriangleAlert :size="34" color="var(--primary)" />
            </span>
            <h2>Les Enjeux</h2>
        </div>

        <!--Une zone flexible (Flexbox) contenant 3 colonnes identiques.-->
        <div class="flex-container">

            <!--Chaque colonne est divisée en deux : à gauche l'icône (le triangle), à droite le texte.-->
            <div class="column">

                <!--Colone 1-->
                <div class="icon-triangle">
                    <Car color="var(--background)" />
                </div>

                <div class="text-content">
                    <span class="stat-number">34%</span>
                    <p class="stat-desc">des émissions de CO2 proviennent du secteur des transports</p>
                </div>

            </div>

            <div class="column">

                <!--Colone 2-->
                <div class="icon-triangle" >
                    <Cloudy color="var(--background)" centered/>
                </div>

                <div class="text-content">
                    <span class="stat-number">9 tonnes</span>
                    <p class="stat-desc" >d’émissions moyennes par individus en France chaque année</p>
                </div>

            </div>

            <div class="column">

                <!--Colone 3-->
                <div class="icon-triangle">
                    <Goal color="var(--background)" />
                </div>

                <div class="text-content">
                    <span class="stat-number">-55%</span>
                    <p class="stat-desc">de réduction de ces émissions d’ici 2030 pour limiter le réchauffement</p>
                </div>

            </div>

        </div>

        <!--Un pied de page arrondi pour la source-->
        <div class="source-bar">
        <span>ⓘ Toutes les données proviennent de sources vérifiées<a href="https://ecologie.gouv.fr">ecologie.gouv.fr</a></span>
        </div>

    </div>

</template>

<style scoped>
/* 1. Le fond et le centrage global */
.section-enjeux {
  background: linear-gradient(to bottom, #f0fdfa, #e6f7f4); /* Dégradé léger partant du bas éventuèlement à mettre en var glob */
  padding: 80px 20px;
  font-family: 'Arial', 'Inter'; /* police par défault de tout les text */
  color: var(--text);
  display: flex; /* pour pouvoir faire des colonnes */
  flex-direction: column; /* sans ça ça aligne tout en ligne */
  align-items: center; /* centre horizontalement */
}

/* 2. Le Titre */
.titre-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 50px;
}

.titre-container h2 {
  /* Dégradé horizontal : Clair à gauche -> Foncé à droite */
  background: linear-gradient(to right, var(--primary), oklch(50% 0.12 160));

  /* On découpe le fond pour qu'il n'apparaisse que dans les lettres */
  -webkit-background-clip: text;
  background-clip: text;

  /* On rend le texte transparent pour laisser voir le dégradé */
  color: transparent;

  font-size: 1.5rem;
  font-weight: 800; /* Un peu plus épais pour bien voir le dégradé */
  margin: 0;
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
  align-items: center; /* Aligne l'icône et le texte verticalement */
  gap: 15px;
  flex: 1;
  min-width: 280px; /* Évite que les colonnes soient trop écrasées */
}

/* 5. Le triangle  */
.icon-triangle {
  background-image: url("/images/triangle_shape.png");
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
  font-size: 1.8rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.3;
  color: #334155;
}

/* 7. La barre de source */
.source-bar {
  border: 1px solid var(--primary);
  background-color: white;
  padding: 8px 24px;
  border-radius: 50px;
  font-size: 0.85rem;
  color: var(--primary);
}

.source-bar span {
    display: flex;
    align-items: center;
    gap: 8px;
}

.source-bar a {
  /* On enlève le soulignement */
  text-decoration: none;
  /* On lui donne la même couleur que le reste du texte de la bulle */
  color: inherit;
  font-weight: bold;
}

</style>

<script setup>

import { TriangleAlert, Car, Cloudy, Goal } from "lucide-vue-next";

useHead({
  title: "EnjeuxSection",
});

</script>