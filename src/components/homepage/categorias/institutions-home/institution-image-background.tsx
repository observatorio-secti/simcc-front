import { getFirestore, doc, getDoc } from "firebase/firestore";

// Função para buscar a imagem da instituição pelo ID
export const getInstitutionImageBackground = async (institutionId: string): Promise<string | null> => {
  if (!institutionId) return null; // Verifica se o ID foi passado

  const db = getFirestore(); // Inicializa o Firestore
  const docRef = doc(db, "institutions", institutionId); // Referência ao documento da instituição
  const docSnap = await getDoc(docRef); // Obtém o documento

  if (docSnap.exists()) {
    return docSnap.data().img_background || null; // Retorna a URL da imagem (img_perfil) ou null se não existir
  } else {
    console.warn(`Instituição com ID ${institutionId} não encontrada.`);
    return null;
  }
};


