async function autodectecteImages(url) {
    try {
        const imgFind = []
        // 1. Récupère le HTML de la page
        const response = await fetch(url);
        const html = await response.text();

        // 2. Cherche les favicons dans le HTML
        const regex = /<link\s[^>]*rel=["'](?:shortcut\sicon|icon)["'][^>]*href=["']([^"']+)["'][^>]*(?:sizes=["']([^"']+)["'])?[^>]*>/gi;
        let match;
        let largestFavicon = { url: null, size: 0 };
        let i = 0;
        let defaultFavicon = null;
        while ((match = regex.exec(html)) !== null) {
            let faviconUrl = new URL(match[1], url).href; // Résout les URLs relatives
            let size = match[2] ? parseInt(match[2].split("x")[0]) : faviconUrl.endsWith("favicon.ico") ? 16 : detectIconSize(faviconUrl);
            imgFind.push({ url: faviconUrl, name: "favicon-"+i++ , size });
            if (size > largestFavicon.size) {
                largestFavicon = { url: faviconUrl, size };
            }
        }
        imgFind.push({ url: largestFavicon.url, name: "largestFavicon" , size: largestFavicon.size });
        // 3. liste les images doner dans les balises meta
        const metaRegex = /<meta\s+(?:name|property)=["']([^"']+)["'][^>]*\scontent=["']([^"']+)["'][^>]*>/gi;
        let metaMatch;
        while ((metaMatch = metaRegex.exec(html)) !== null) {
            let name = metaMatch[1].toLowerCase();
            if (name.endsWith("image")) {
                imgFind.push({ url: new URL(metaMatch[2], url).href, name });
            }
        }


        imgFind.push({ url: new URL("/favicon.ico", url).href, name: "favicon.ico" , size: 16 }); // Fallback final
        return imgFind;
    } catch (error) {
        console.error("Erreur lors de la récupération du favicon :", error);
        return new URL("/favicon.ico", url).href; // Fallback final
    }
}

function detectIconSize(url) {
    // Extraction des nombres
    let nombres = url.match(/\d+/g)?.map(Number) || [];

    // Tailles d'icônes courantes
    let taillesIcones = new Set([16, 32, 48, 64, 96, 128, 144, 152, 196, 256, 512, 1024]);

    // Filtrer les tailles valides et récupérer la plus grande
    let taillesValides = nombres.filter(nombre => taillesIcones.has(nombre));
    if (taillesValides.length) {
        return Math.max(...taillesValides);
    }

    // Analyse du texte pour deviner la taille
    let motsCles = [
        { mot: "small", taille: 32 },
        { mot: "medium", taille: 64 },
        { mot: "large", taille: 128 },
        { mot: "xlarge", taille: 256 },
        { mot: "favicon", taille: 16 }
    ];

    for (let { mot, taille } of motsCles) {
        if (url.toLowerCase().includes(mot)) {
            return taille;
        }
    }

    // Par défaut, supposer une taille standard
    return 16; // Taille par défaut si aucune info trouvée
}


module.exports = { detectIconSize , autodectecteImages}