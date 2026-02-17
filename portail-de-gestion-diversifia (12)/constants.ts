
import { SalesData, SalaryData, initialSalaryData, initialSalesData } from './types';

// Liste des vendeurs actifs classée par ordre alphabétique
export const SALES_AGENTS: string[] = [
  "Achraf",
  "Adnane Lommuni",
  "Ayoub Zahir",
  "Fouad Amarti",
  "Hamza Cherradi",
  "Hamza Sitel",
  "Ilyas Hassi Rahou",
  "Ismail bahbouhi",
  "Karim Zidi",
  "Khalid Zaoug",
  "Lahcen Manssoum",
  "Mehdi El Yaouissi",
  "Mehdi Kouyes",
  "Mounir majidi",
  "Oussama Enacri",
  "Sabir Arsaoui",
  "Said Serrar",
  "Salah Eddine Abou Elyakine",
  "Tarik El Harradi",
  "Youssef Houass",
  "Zakaria Haroual"
].sort((a, b) => a.localeCompare(b));

// Liste des prestataires partenaires
export const PRESTATAIRES: string[] = [
  "MH",
  "NEWERACOM",
  "ENEGIE",
  "ESCOT",
  "CAMUSAT",
  "SCOMM TDLTE",
  "BTSCOM TDLTE",
  "3GCOM TDLTE",
  "NOMATIS",
  "MOBILECOM"
].sort();

// Liste noire pour filtrer les anciens collaborateurs des vues dynamiques (Cloud)
export const EXCLUDED_AGENTS = [
  "allache haitam",
  "ayman jouali",
  "moncef chakir",
  "omar kerfali"
];

// Liste exhaustive des villes du Maroc
export const MOROCCAN_CITIES: string[] = [
  "Agadir", "Ahfir", "Aïn Harrouda", "Aïn Taoujdate", "Aït Melloul", "Aït Ourir", "Al Hoceïma", "Al Ksar El Kebir", "Amizmiz", "Aoufous", "Arfoud", "Asilah", "Azemmour", "Azrou", 
  "Ben Ahmed", "Ben Guerir", "Beni Mellal", "Benslimane", "Berkane", "Berrechid", "Bhalil", "Bir Gandouz", "Bouarfa", "Boujdour", "Bouznika", 
  "Casablanca", "Chefchaouen", "Chichaoua", 
  "Dakhla", "Dar Bouazza", "Demnate", "Drargua", 
  "El Hajeb", "El Jadida", "El Kelaa des Sraghna", "Er-Rich", "Errachidia", "Essaouira", 
  "Fès", "Fnideq", "Fquih Ben Salah", 
  "Guelmim", "Guercif", 
  "Had Soualem", "Harhoura", 
  "Ifrane", "Imzouren", "Inezgane", 
  "Jerada", 
  "Kenitra", "Khemisset", "Khenifra", "Khouribga", "Ksar El Kebir", 
  "Laâyoune", "Lagouira", "Larache", 
  "Marrakech", "Martil", "M'diq", "Mediouna", "Meknès", "Midelt", "Mirleft", "Missour", "Mohammedia", "Moulay Bousselham", 
  "Nador", "Nouaceur", 
  "Oualidia", "Ouarzazate", "Ouazzane", "Oujda", "Oulad Teima", 
  "Rabat", "Rissani", 
  "Safi", "Saïdia", "Salé", "Sefrou", "Settat", "Sidi Bennour", "Sidi Ifni", "Sidi Kacem", "Sidi Rahal", "Sidi Slimane", "Skhirat", "Souk El Arbaa", 
  "Taddert", "Tanger", "Tan-Tan", "Taounate", "Taourirt", "Tarfaya", "Taroudant", "Tata", "Taza", "Temara", "Tetouan", "Tiflet", "Tiznit", 
  "Youssoufia", 
  "Zagora"
].sort();

/**
 * LISTE OFFICIELLE DES OFFRES ORANGE MAROC
 * Utilisée pour la saisie ADV et le calcul des commissions
 */
export const PRODUCT_OFFERS = [
  { id: 'ftth50', label: 'FIBRE 50M ESE' },
  { id: 'ftth500', label: 'FIBRE 500M ESE' },
  { id: 'ftth20', label: 'FIBRE 20M ESE' },
  { id: 'ftth200', label: 'FIBRE 200M ESE' },
  { id: 'ftth100', label: 'FIBRE 100M ESE' },
  { id: 'ftth1000', label: 'FIBRE 1000M ESE' },
  { id: 'adsl', label: 'ADSL' },
  { id: 'tdlte', label: 'TDLTE' },
  { id: 'partage50', label: 'Partage FIBRE 50M ESE' },
  { id: 'partage20', label: 'Partage FIBRE 20M ESE' },
  { id: 'partage200', label: 'Partage FIBRE 200M ESE' },
  { id: 'partage100', label: 'Partage FIBRE 100M ESE' },
  { id: 'bbox_fixe_plus_349_ae', label: 'BUSINESS BOX FIXE+ 349 AE' },
  { id: 'bbox_fixe_249_se', label: 'BUSINESS BOX FIXE 249 SE' },
  { id: 'bbox_fixe_249_ae', label: 'BUSINESS BOX FIXE 249 AE' },
  { id: 'box5g', label: 'BUSINESS BOX 5G' },
  { id: 'box5g_premium', label: 'BUSINESS BOX 5G Premium' },
  { id: 'box5g_plus', label: 'BUSINESS BOX 5G +' },
  { id: 'box249', label: 'BUSINESS BOX 4G 249' },
  { id: 'box349', label: 'BUSINESS BOX 4G + 349' },
  { id: 'sim_bbox_fixe_plus_349', label: 'SIM Only BBOX FIXE+ 349' },
  { id: 'sim_bbox_fixe_249', label: 'SIM Only BBOX FIXE 249' },
  { id: 'sim_bbox_4g_plus', label: 'SIM ONLY – BUSINESS BOX 4G+' },
  { id: 'sim_bbox_4g_prem', label: 'SIM ONLY – BUSINESS BOX 4G Premium' },
  { id: 'internet_mob_80', label: 'Internet Mobile Pro 80 Go' },
  { id: 'internet_mob_35', label: 'Internet Mobile Pro 35 Go' },
  { id: 'internet_mob_150', label: 'Internet Mobile Pro 150 Go' },
  { id: 'internet_mob_100', label: 'Internet Mobile Pro 100 Go' },
  { id: 'pro_connect_70', label: 'Forfait Pro CONNECT 70Go ST' },
  { id: 'pro_connect_40', label: 'Forfait Pro Connect 40 ST' },
  { id: 'pro_connect_30', label: 'FORFAIT PRO CONNECT 30 ST' },
  { id: 'pro_connect_15', label: 'Forfait Pro Connect 15 ST' },
  { id: 'pro_connect_100', label: 'Forfait Pro CONNECT 100Go ST' },
  { id: 'forf50h', label: 'Forfait Orange Pro 50H ST' },
  { id: 'forf40h', label: 'Forfait Orange Pro 40H ST' },
  { id: 'forf15h', label: 'Forfait Orange Pro 15H+15Go ST' },
  { id: 'illimiteNat', label: 'Forfait illimité national + ST' },
  { id: 'forf6h', label: 'FF Orange Pro 6H+6Go ST' },
  { id: 'forf25h', label: 'FF Orange Pro 25H+25Go ST' },
  { id: 'illimiteSilver', label: 'FF Illimité Pro Silver ST' },
  { id: 'illimitePremium', label: 'FF Illimité Pro Premium ST' },
  { id: 'illimiteProNat', label: 'FF illimité pro national ST' },
  { id: 'illimiteGold', label: 'FF Illimité Pro Gold ST' },
  { id: 'wifi_pro_pack', label: 'Wifi Pro Pack Connect' },
  { id: 'wifi_pro_plus', label: 'Wifi Pro Connect +' },
  { id: 'smartfax_99', label: 'Smart-fax limité 99dh' },
  { id: 'smartfax_29', label: 'Smart-fax limité 29dh' },
  { id: 'pack_pro_connect_15', label: 'Pack Forfait Pro Connect 15' },
  { id: 'pack_forf_6h', label: 'Pack Forfait Orange Pro 6H' }
];

// Définit la valeur de commission (en MAD) pour une seule vente de chaque type.
export const COMMISSION_RATES: Record<keyof SalesData, number> = {
  // Internet
  tdlte: 250,
  ftth20: 200,
  ftth50: 250,
  ftth100: 300,
  ftth200: 400,
  ftth500: 450,
  adsl: 99,

  // Box
  box249: 100,
  box349: 125,
  box5g: 125,

  // Mobile
  forf6h: 40,
  forf15h: 60,
  forf22h: 75,
  forf34h: 100,
  illimiteNat: 125,

  // Partage
  partage20: 200,
  partage50: 250,
  partage100: 300,
  partage200: 400,
};

// Objectifs (Conservés comme Configuration pour les graphiques)
export const NOVEMBER_OBJECTIVES: Record<string, number> = {
  "ayoub": 32, "Ayoub Zahir": 32,
  "oussama": 37, "Oussama Enacri": 37,
  "cherradi": 47, "Hamza Cherradi": 47,
  "bahbouhi": 47, "Ismail bahbouhi": 47,
  "mehdi kouy": 47, "Mehdi Kouyes": 47,
  "mehdi": 37, "Mehdi El Yaouissi": 37,
  "youssef": 30, "Youssef Houass": 30,
  "tarik": 30, "Tarik El Harradi": 30,
  "ilyas": 28, "Ilyas Hassi Rahou": 28,
  "khalid": 47, "Khalid Zaoug": 47,
  "zakaria": 47, "Zakaria Haroual": 47,
  "said serrar": 36, "Said Serrar": 36,
  "sitel": 36, "Hamza Sitel": 36,
  "adnane": 35, "Adnane Lommuni": 35
};

// Catalogue des incidents
export const INCIDENT_CATALOG = [
  { id: 'no_kit', label: "Absence Gilet / Kit Orange", amount: 100 },
  { id: 'zero_sales', label: "Journée 0 Vente", amount: 150 },
  { id: 'no_respect', label: "Non respect des consignes", amount: 300 },
  { id: 'fraud', label: "Dépôt Dossier Frauduleux", amount: 500 },
  { id: 'behavior', label: "Comportement Inapproprié", amount: 200 },
  { id: 'late_report', label: "Retard Reporting", amount: 50 },
];
