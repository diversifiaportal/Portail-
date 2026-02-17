import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  Firestore
} from "firebase/firestore";
import { firebaseConfig } from "../firebaseConfig";

let app: FirebaseApp | null = null;
export let db: Firestore | null = null;

const isFirebaseConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("VOTRE_CLE");

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Activation de la persistance hors-ligne pour éviter les erreurs réseaux
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      ignoreUndefinedProperties: true 
    });

  } catch (e) {
    console.error("Erreur d'initialisation Firebase:", e);
  }
}

// Fonction utilitaire pour nettoyer les objets (retirer undefined)
const cleanObject = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

// Fonction spéciale pour ajouter un élément à une liste sans écraser le reste (Atomic)
export const addArrayItem = async (key: string, item: any) => {
  // CRITIQUE : On nettoie l'objet avant l'envoi. Firebase rejette les 'undefined' dans les tableaux.
  const cleanItem = cleanObject(item);

  if (!db) {
     // Fallback si pas de DB
     const current = await getCloudData(key) || [];
     const updated = [cleanItem, ...current];
     return saveCloudData(key, updated);
  }
  
  try {
    const docRef = doc(db, "diversifia_store", key);
    // arrayUnion ajoute l'élément uniquement, sans toucher aux autres données
    await updateDoc(docRef, {
      payload: arrayUnion(cleanItem),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (e: any) {
    console.warn("Echec arrayUnion (doc inexistant ?), tentative création:", e);
    // Si le document n'existe pas encore, on le crée
    try {
        const docRef = doc(db, "diversifia_store", key);
        await setDoc(docRef, { 
            payload: [cleanItem], 
            updatedAt: new Date().toISOString() 
        }, { merge: true });
        return true;
    } catch (err) {
        console.error("Echec total sauvegarde:", err);
        return false;
    }
  }
};

export const saveCloudData = async (key: string, data: any) => {
  if (!key) return false;
  
  const cleanData = cleanObject(data);
  const updatedAt = new Date().toISOString();
  const storageObj = { payload: cleanData, updatedAt };

  let localSuccess = false;

  // 1. Sauvegarde Prioritaire LocalStorage (Backup)
  try {
    localStorage.setItem(`diversifia_db_${key}`, JSON.stringify(storageObj));
    localSuccess = true;
  } catch (e) {
    console.warn("LocalStorage error:", e);
  }

  // 2. Tentative Sauvegarde Cloud
  if (db) {
    try {
      const docRef = doc(db, "diversifia_store", key);
      await setDoc(docRef, storageObj, { merge: true });
      return true; // Succès total
    } catch (e: any) {
      console.error(`[CLOUD ERROR] Echec sauvegarde Cloud ${key}:`, e);
      // Si Cloud échoue mais Local OK, on retourne true pour ne pas bloquer l'utilisateur
      return localSuccess; 
    }
  }

  return localSuccess;
};

export const getCloudData = async (key: string) => {
  if (!key) return null;

  // Lecture Backup Local
  const localRaw = localStorage.getItem(`diversifia_db_${key}`);
  const localData = localRaw ? JSON.parse(localRaw) : null;

  if (db) {
    try {
      const docRef = doc(db, "diversifia_store", key);
      // getDoc lit le cache Firestore si hors ligne
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (cloudData && cloudData.payload) {
           try {
             localStorage.setItem(`diversifia_db_${key}`, JSON.stringify(cloudData));
           } catch(e) {}
           return cloudData.payload;
        }
      }
    } catch (e) {
      console.warn(`[CLOUD] Lecture impossible pour ${key}, fallback local.`);
    }
  }

  return localData ? localData.payload : null;
};

export const isOnline = () => {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
};

export const safeJSON = (data: any) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return String(data);
  }
};