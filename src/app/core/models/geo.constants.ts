export const SITUATIONS_MATRIMONIALES = [
  'Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'
];

export const LANGUES = [
  'Français', 'Anglais', 'Arabe', 'Espagnol',
  'Allemand', 'Portugais', 'Haoussa', 'Fulfuldé', 'Ewondo'
];

export const PAYS_AFRIQUE = [
  'Cameroun', 'Nigeria', 'Tchad', 'République Centrafricaine',
  'Guinée Équatoriale', 'Gabon', 'Congo', 'RD Congo',
  'Côte d\'Ivoire', 'Sénégal', 'Mali', 'France', 'Autre'
];

export const REGIONS_CAMEROUN = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord',
  'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
];

export const DEPARTEMENTS_PAR_REGION: Record<string, string[]> = {
  'Adamaoua':    ['Djerem', 'Faro-et-Déo', 'Mayo-Banyo', 'Mbéré', 'Vina'],
  'Centre':      ['Haute-Sanaga', 'Lekié', 'Mbam-et-Inoubou', 'Mbam-et-Kim', 'Méfou-et-Afamba', 'Méfou-et-Akono', 'Mfoundi', 'Nyong-et-Kellé', 'Nyong-et-Mfoumou', 'Nyong-et-So\'o'],
  'Est':         ['Boumba-et-Ngoko', 'Haut-Nyong', 'Kadey', 'Lom-et-Djérem'],
  'Extrême-Nord':['Diamaré', 'Logone-et-Chari', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava', 'Mayo-Tsanaga'],
  'Littoral':    ['Moungo', 'Nkam', 'Sanaga-Maritime', 'Wouri'],
  'Nord':        ['Bénoué', 'Faro', 'Mayo-Louti', 'Mayo-Rey'],
  'Nord-Ouest':  ['Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Mezam', 'Momo', 'Ngo-Ketunjia'],
  'Ouest':       ['Bamboutos', 'Haut-Nkam', 'Hauts-Plateaux', 'Koung-Khi', 'Menoua', 'Mifi', 'Nde', 'Noun'],
  'Sud':         ['Dja-et-Lobo', 'Mvila', 'Océan', 'Vallée-du-Ntem'],
  'Sud-Ouest':   ['Fako', 'Koupé-Manengouba', 'Lebialem', 'Manyu', 'Meme', 'Ndian'],
};

export const WIZARD_ROUTES = [
  'recommandation',
  'identification',
  'specialisation',
  'cursus',
  'contacts',
  'finish',
] as const;
