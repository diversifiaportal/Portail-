import mysql from 'mysql2/promise';
import * as admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Firebase Admin for server-side operations
if (!admin.apps.length) {
  admin.initializeApp();
}
const firestore = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let connection;
  try {
    // 1. Connect to MySQL (Dolibarr)
    // Variables should be set in the deployment environment (Vercel/GCP dashboard)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '46.105.76.166',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'diversif_skydetra',
      password: process.env.DB_PASSWORD || 'Skydetra*2026*',
      database: process.env.DB_NAME || 'diversif_doli900',
      connectTimeout: 20000
    });

    console.log('Connected to MySQL');

    // 2. Fetch User Mapping
    const [userRows]: any = await connection.execute("SELECT rowid, firstname, lastname FROM llxfb_user");
    const userMap = new Map();
    userRows.forEach((u: any) => {
      const fullName = `${u.firstname || ''} ${u.lastname || ''}`.trim();
      userMap.set(u.rowid, fullName || "Vendeur Inconnu");
    });

    // 3. Fetch Draft Orders (fk_statut = 0)
    const [orderRows]: any = await connection.execute("SELECT rowid, ref, date_creation, fk_user_author, fk_soc FROM llxfb_commande WHERE fk_statut = 0");
    if (!orderRows || orderRows.length === 0) {
      return res.status(200).json({ success: true, count: 0, message: "No draft orders found" });
    }

    // 4. Fetch Societies and Extrafields
    const socIds = [...new Set(orderRows.map((o: any) => o.fk_soc))].filter(Boolean);
    const orderIds = orderRows.map((o: any) => o.rowid);

    let socMap = new Map();
    if (socIds.length > 0) {
      // Fix: renamed sRows to socRows to match its usage below on line 62
      const [socRows]: any = await connection.query("SELECT rowid, nom, phone, town FROM llxfb_societe WHERE rowid IN (?)", [socIds]);
      socRows.forEach((s: any) => socMap.set(s.rowid, s));
    }

    const [oeRows]: any = await connection.query("SELECT fk_object, val_cont FROM llxfb_commande_extrafields WHERE fk_object IN (?)", [orderIds]);
    const orderExtraMap = new Map(oeRows.map((oe: any) => [oe.fk_object, oe.val_cont]));

    // Offre Map
    const offreMap: Record<number, string> = {
      1: "BUSINESS BOX FIXE 249 AE", 2: "TDLTE", 3: "FIBRE 20M ESE", 4: "FIBRE 50M ESE", 5: "FIBRE 100M ESE", 6: "FIBRE 200M ESE",
      7: "FF Orange Pro 6H+6Go ST", 8: "Forfait Orange Pro 15H+15Go ST", 10: "Forfait illimité national + ST", 11: "FF illimité pro national ST",
      12: "FF illimité Pro Silver ST", 31: "FF illimité Pro Premium ST", 13: "FF illimité Pro Gold ST", 32: "Forfait Pro Connect 15 ST",
      33: "FORFAIT PRO CONNECT 30 ST", 34: "Forfait Pro CONNECT 70Go ST", 35: "Forfait Pro Connect 40 ST", 14: "Wifi Pro Pack Connect",
      15: "Wifi Pro Connect +", 17: "BUSINESS BOX 4G 249", 18: "BUSINESS BOX 4G + 349", 23: "SIM Only BBOX FIXE 249",
      24: "SIM ONLY – BUSINESS BOX 4G+", 25: "SIM ONLY – BUSINESS BOX 4G Premium", 26: "Pack Forfait Orange Pro 6H", 27: "Pack Forfait Pro Connect 15",
      28: "BUSINESS BOX FIXE+ 349 AE", 29: "SIM Only BBOX FIXE+ 349", 30: "ADSL", 19: "BUSINESS BOX FIXE 249 SE", 20: "FF Orange Pro 25H+25Go ST",
      40: "Partage FIBRE 20M ESE", 41: "Partage FIBRE 50M ESE", 42: "Partage FIBRE 100M ESE", 43: "Partage FIBRE 200M ESE",
      50: "BUSINESS BOX 5G"
    };

    // 5. Update Firestore Transactionally
    const docRef = firestore.collection('diversifia_store').doc('adv_orders');
    let importedCount = 0;

    await firestore.runTransaction(async (t) => {
      const docSnap = await t.get(docRef);
      let currentOrders = docSnap.exists ? (docSnap.data()?.payload || []) : [];
      
      // CORRECTIF SYNC: Normaliser les références existantes (trim + suppression des espaces multiples)
      // Cela évite que des espaces invisibles dans les refs sauvegardées causent un re-import
      const cleanRef = (r: string) => (r || '').trim().replace(/\s+/g, ' ');
      const existingRefs = new Set(currentOrders.map((o: any) => cleanRef(o.refContrat)));
      // Ajouter aussi les doliRef nettoyées pour éviter les doublons
      currentOrders.forEach((o: any) => {
        if (o.doliRef) existingRefs.add(cleanRef(o.doliRef));
      });
      const newOrdersToAdd = [];
      const nowISO = new Date().toISOString().slice(0, 16);

      for (const order of orderRows) {
        const client = socMap.get(order.fk_soc);
        const finalRef = cleanRef(orderExtraMap.get(order.rowid) || order.ref || '');
        
        if (!finalRef || !client || existingRefs.has(finalRef)) continue;

        newOrdersToAdd.push({
          id: `DOLI-${order.rowid}`,
          refContrat: finalRef, // Déjà nettoyé par cleanRef
          dateDepot: new Date(order.date_creation).toISOString().slice(0, 16),
          dateSaisi: nowISO,
          dateTraitement: nowISO,
          commercial: cleanRef(userMap.get(order.fk_user_author) || "Dolibarr Sync"),
          raisonSociale: cleanRef((client.nom || "Client Inconnu").toUpperCase()),
          telephone: (client.phone || "").replace(/\s/g, ''),
          offre: "À qualifier",
          ville: cleanRef(client.town || ""),
          validation: 'EN ATTENTE', etape: 'ÉTUDE', statutSi: 'En Etudes',
          isConfirmed: false, linkCrm: `Dolibarr ID: ${order.rowid}`,
          doliRef: cleanRef(order.ref || ''),
          isManuallyCreated: false
        });
        existingRefs.add(finalRef);
      }

      if (newOrdersToAdd.length > 0) {
        importedCount = newOrdersToAdd.length;
        const totalPayload = [...newOrdersToAdd, ...currentOrders].slice(0, 2000);
        t.set(docRef, { payload: totalPayload, updatedAt: new Date().toISOString() }, { merge: true });
      }
    });

    await connection.end();
    return res.status(200).json({ success: true, count: importedCount, message: "Sync complete" });

  } catch (err: any) {
    console.error("Sync Error:", err);
    if (connection) await connection.end();
    return res.status(500).json({ 
      success: false, 
      error: err.message || "Internal server error",
      details: "Check database connectivity and credentials." 
    });
  }
}