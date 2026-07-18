import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import unorm from 'unorm';

interface Csv {
  great_area: string
  term: string
  frequency: string
  type_: string
  term_normalize:string
}


import { getFirestore,  collection, getDocs, addDoc } from 'firebase/firestore';
import { Button } from '../../ui/button';

export function FirebaseTermsImport() {
  const [filteredItems, setFilteredItems] = useState<Csv[]>([]);
  const db = getFirestore();

  useEffect(() => {
    const filePath = "../dicionario.csv";

    const fetchData = async () => {
      try {
        const response = await fetch(filePath);
        const text = await response.text();

        Papa.parse(text, {
          complete: (result: any) => {
            const parsedData = result.data;
        
            setFilteredItems(parsedData); 

          },
          header: true,
          skipEmptyLines: true,
          delimiter: ',',
          encoding: 'UTF-8',
        });
      } catch (error) {
        console.error('Erro ao carregar o arquivo:', error);
      }
    };

    fetchData();
  }, []);

  const importDataToFirebase = async (data: Csv[]) => {
    try {
      // Verifica se o termo já existe antes de importar
      const programRef = collection(db, 'termos_busca');
      const querySnapshot = await getDocs(programRef);
  
      // Extrai os termos existentes dos documentos
      const existingTermValues = querySnapshot.docs.map(doc => doc.data().term);
  
      // Itera sobre os dados e envia cada registro para o Firebase se o termo não existir
      for (const item of data) {
        // Verifica se o termo e o type_ já existem antes de importar
        const existingTerm = existingTermValues.includes(item.term);
        const existingType = querySnapshot.docs.some(doc => doc.data().term === item.term && doc.data().type_ === item.type_);
      
        if (!existingTerm && !existingType) {
          await addDoc(programRef, item);
        } else if (existingTerm && existingType) {
          console.log(`O termo "${item.term}" com o type_ "${item.type_}" já existe no banco de dados.`);
        } else if (existingTerm) {
          console.log(`O termo "${item.term}" já existe no banco de dados.`);
        } else {
          console.log(`O type_ "${item.type_}" já existe para o termo "${item.term}" no banco de dados.`);
        }
      }
      
  
      console.log('Dados importados para o Firebase com sucesso!');
    } catch (error) {
      console.error('Erro ao importar dados para o Firebase:', error);
    }
  };


  return(
    <div>
      <Button onClick={() => importDataToFirebase(filteredItems)}>Importar</Button>
    </div>
  )
}