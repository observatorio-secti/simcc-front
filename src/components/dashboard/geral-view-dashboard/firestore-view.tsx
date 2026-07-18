// FirestoreView.tsx
import { useEffect, useState } from "react"
import { getFirestore, collection, getDocs, onSnapshot, doc } from "firebase/firestore"
import { Card, CardContent } from "../../ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs"
import { Button } from "../../ui/button"
import { Alert } from "../../ui/alert"
import { BetweenHorizonalEnd, Database, Download, Home, Pencil, Text } from "lucide-react"
import { CaretRight } from "phosphor-react"
import { ScrollArea, ScrollBar } from "../../ui/scroll-area"

type FirestoreData = Record<string, any>

export function FirestoreView() {
  const db = getFirestore()

  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [documents, setDocuments] = useState<{ id: string }[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [docFields, setDocFields] = useState<FirestoreData | null>(null)

  // 🔹 Pega todas as coleções do Firestore
  useEffect(() => {
    const fetchCollections = async () => {
     
      const collectionsArray = ["background", "profiles", "institutions", "historico", "patrimonio"]
      setCollections(collectionsArray)
    }
    fetchCollections()
  }, [db])

  // 🔹 Atualiza os documentos da coleção selecionada
  useEffect(() => {
    if (!selectedCollection) return

    const unsubscribe = onSnapshot(collection(db, selectedCollection), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id }))
      setDocuments(docs)
    })

    return () => unsubscribe()
  }, [db, selectedCollection])

  // 🔹 Escuta os dados do documento selecionado
  useEffect(() => {
    if (!selectedCollection || !selectedDocId) return

    const docRef = doc(db, selectedCollection, selectedDocId)
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setDocFields(docSnap.data() || null)
    })

    return () => unsubscribe()
  }, [db, selectedCollection, selectedDocId])

  return (
    <Alert className="p-0">
        <div className="flex items-center gap-3 p-3 justify-between border-b dark:border-b-neutral-800">
           <div className="flex items-center gap-3">
           <Button onClick={() => {
           
                setSelectedCollection(null)
                setSelectedDocId(null)
                setDocFields(null)
              
           }} variant={'ghost'} size={'icon'} className="h-8 w-8"><Home size={16}/></Button>

{selectedCollection && (
    
    <div className="flex items-center gap-3">
    <CaretRight size={12}/>
    
    <p  onClick={() => {
           
           setSelectedDocId(null)
           setDocFields(null)
      
         
      }}className="font-medium text-sm cursor-pointer">{selectedCollection}</p>
    </div>
)}

{selectedDocId && (
    <div className="flex items-center gap-3">
    <CaretRight size={12}/>
    
    <p className="font-medium text-sm ">{selectedDocId}</p>
    </div>
)}
           </div>


           <Button variant={'ghost'} size={'sm'} className="h-8 "><Download size={16}/>Baixar resultado</Button>
        </div>
        <div className="grid grid-cols-3 ">
      {/* Coleções */}
      <div className="h-full border-r dark:border-r-neutral-800">
        <CardContent className="p-0">
        <div className="flex items-center h-[46px]  text-gray-500 gap-3 p-3 px-5  border-b dark:border-b-neutral-800">
        <Database size={16}/>
    
    <p  onClick={() => {
           
           setSelectedCollection(null)
                setSelectedDocId(null)
                setDocFields(null)
      
         
      }}className="font-medium text-sm cursor-pointer">Banco de dados</p>
        </div>
        <ScrollArea className="h-[70vh]">
            {collections.map((col) => (
              <div
                
                key={col}
                className={`w-full group flex gap-1 p-1 justify-between  px-3 items-center text-gray-500 transition-all  cursor-pointer text-sm ${selectedCollection === col ? "bg-neutral-100 hover:bg-neutral-200" : "hover:bg-neutral-200"}`}
                onClick={() => {
                  setSelectedCollection(col)
                  setSelectedDocId(null)
                  setDocFields(null)
                }}
              >
                 <div className="flex gap-1 items-center">
                 <div className="h-8 w-8 flex items-center justify-center group-hover:hidden"></div>
                 <div onClick={() => {

}}  className="h-8 w-8 hidden items-center justify-center group-hover:flex"><Pencil size={16}/></div>
          {col}
                 </div>

                 {selectedCollection === col && (
                    <div  className="h-8 w-8 flex items-center justify-center"><CaretRight size={16}/></div>
                 )}
              </div>
            ))}

<ScrollBar orientation='vertical'/>
          </ScrollArea>
        </CardContent>
      </div>

      {/* Documentos */}
      {selectedCollection && (
        <div className="h-full border-r dark:border-r-neutral-800">
        <CardContent className="p-0">
        <div className="flex items-center h-[46px]  text-gray-500 gap-3 p-3 px-5  border-b dark:border-b-neutral-800">
        <BetweenHorizonalEnd size={16}/>
    
    <p  onClick={() => {
           
                setSelectedDocId(null)
                setDocFields(null)
      
         
      }}className="font-medium text-sm cursor-pointer">{selectedCollection}</p>
        </div>
        <ScrollArea className="h-[70vh]">
            {documents.map((doc) => (
             <div
                
             key={doc.id}
             className={`w-full group flex gap-1 p-1 justify-between  px-3 items-center text-gray-500 transition-all  cursor-pointer text-sm ${selectedDocId === doc.id ? "bg-neutral-100 hover:bg-neutral-200" : "hover:bg-neutral-200"}`}
             onClick={() => {
               setSelectedDocId(doc.id)
               
             }}
           >
              <div className="flex gap-1 items-center">
              <div className="h-8 w-8 flex items-center justify-center group-hover:hidden"></div>
              <div onClick={() => {

}}  className="h-8 w-8 hidden items-center justify-center group-hover:flex"><Pencil size={16}/></div>
       {doc.id}
              </div>

              {selectedDocId === doc.id && (
                 <div  className="h-8 w-8 flex items-center justify-center"><CaretRight size={16}/></div>
              )}
           </div>
            ))}
             <ScrollBar orientation='vertical'/>
          </ScrollArea>
        </CardContent>
      </div>
      )}

      {/* Campos do Documento */}
     {selectedDocId && (
         <div className="h-full border-r dark:border-r-neutral-800">
         <CardContent className="p-0">
         <div className="flex items-center h-[46px]  text-gray-500 gap-3 p-3 px-5  border-b dark:border-b-neutral-800">
         <Text size={16}/>
     
     <p className="font-medium text-sm cursor-pointer">{selectedDocId}</p>
         </div>
         <ScrollArea className="h-[70vh]">
         {docFields ? (
             <Tabs defaultValue="json" className="w-full">
               <TabsList className="w-full">
                 <TabsTrigger value="json">JSON</TabsTrigger>
                 <TabsTrigger value="fields">Campos</TabsTrigger>
               </TabsList>
               <TabsContent value="json">
                 <pre className="bg-muted p-4 rounded text-xs whitespace-pre-wrap">
                   {JSON.stringify(docFields, null, 2)}
                 </pre>
               </TabsContent>
               <TabsContent value="fields">
                 <div className="space-y-2 text-sm">
                   {Object.entries(docFields).map(([key, value]) => (
                     <div key={key} className="flex justify-between border-b py-1">
                       <span className="font-medium">{key}</span>
                       <span className="text-muted-foreground">{String(value)}</span>
                     </div>
                   ))}
                 </div>
               </TabsContent>
             </Tabs>
           ) : (
             <p className="text-sm text-muted-foreground">Selecione um documento para ver os dados.</p>
           )}

           <ScrollBar orientation='vertical'/>
         </ScrollArea>
          
         </CardContent>
       </div>
   
     )}

     </div>
    </Alert>
  )
}
