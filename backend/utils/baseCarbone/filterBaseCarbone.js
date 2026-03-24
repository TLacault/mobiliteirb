const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const iconv = require('iconv-lite');

const inputFile = 'Base_Carbone_V23.9.csv';
const outputFile = 'Base_Carbone_V23.9_filtree.csv';

const csvWriter = createCsvWriter({
    path: outputFile,
    header: [
        { id: 'nom', title: 'Nom base français' },
        { id: 'categorie', title: 'Code de la catégorie' },
        { id: 'unite', title: 'Unité français' },
        { id: 'localisation', title: 'Localisation géographique' },
        { id: 'total', title: 'Total poste non décomposé' }
    ],
    fieldDelimiter: ';'
});

async function traiterBaseCarbone() {
    const rawData = [];
    const groups = new Map();

    fs.createReadStream(inputFile)
        .pipe(iconv.decodeStream('latin1'))
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            const unite = (row["Unité français"] || "").toLowerCase();
            const statut = (row["Statut de l'élément"] || "").toLowerCase();
            const totalStr = row["Total poste non décomposé"] ? row["Total poste non décomposé"].replace(',', '.') : "";
            const totalNum = parseFloat(totalStr);

            const isPassagerKm = unite.includes("passager.km") || unite.includes("p.km");
            const isNotArchive = !statut.includes("archivé");

            if (isPassagerKm && isNotArchive && !isNaN(totalNum)) {
                const key = `${row["Nom base français"]}|${row["Code de la catégorie"]}|${row["Unité français"]}|${row["Localisation géographique"]}`;
                
                if (!groups.has(key)) {
                    groups.set(key, { 
                        sum: 0, 
                        count: 0, 
                        data: {
                            nom: row["Nom base français"],
                            categorie: row["Code de la catégorie"],
                            unite: row["Unité français"],
                            localisation: row["Localisation géographique"]
                        } 
                    });
                }
                
                const group = groups.get(key);
                group.sum += totalNum;
                group.count += 1;
            }
        })
        .on('end', async () => {
            const finalResults = Array.from(groups.values()).map(g => ({
                ...g.data,
                total: (g.sum / g.count)
            }));

            try {
                await csvWriter.writeRecords(finalResults);
            } catch (err) {
                console.error("Write error:", err);
            }
        })
        .on('error', (err) => {
            console.error("Read error:", err.message);
        });
}

traiterBaseCarbone();