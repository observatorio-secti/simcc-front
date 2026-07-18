import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

// Função para buscar a imagem da instituição pelo nome
export const getInstitutionImageName = async (institutionName: string): Promise<string | null> => {
  if (!institutionName) return null; // Verifica se o nome foi passado

  const db = getFirestore(); // Inicializa o Firestore
  const institutionsRef = collection(db, "institutions"); // Referência à coleção de instituições

  // Cria uma consulta para buscar pela propriedade "name"
  const q = query(institutionsRef, where("name", "==", institutionName));
  const querySnapshot = await getDocs(q); // Executa a consulta

  if (!querySnapshot.empty) {
    // Pega o primeiro documento encontrado e retorna a imagem
    const doc = querySnapshot.docs[0];
    return doc.data().img_perfil || null;
  } else {
    console.warn(`Instituição com o nome "${institutionName}" não encontrada.`);
    return null;
  }
};
