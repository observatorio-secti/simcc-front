import { Plus } from "lucide-react";
import {  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { AddItemDropdown } from "./add-item-dropdown";
import { Content, items, itemsEspeciais, Keepo } from "./builder-page";
import { useState } from "react";
import { Input } from "../../ui/input";

interface Props {
   number:number
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
}
export function DropdownMenuBuilder(props:Props) {

    const addContentItem = (type: Content["type"], index: number) => {
        props.setKeepoData((prev) => {
          const newItem = { type, title: "", emoji: "", url: "", items: [], order: index,  description:'' };
          const updatedContent = [...prev.content];
      
          updatedContent.splice(index, 0, newItem); // Insere o novo item na posição correta
      
          // Atualiza a ordem dos itens para manter a sequência correta
          const reorderedContent = updatedContent.map((item, i) => ({ ...item, order: i }));
      
          return {
            ...prev,
            content: reorderedContent,
          };
        });
      };

    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredItems = items.filter(item => {
        const normalizeString = (str:any) => str
        .normalize("NFD") // Decompõe os caracteres acentuados
        .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos
        .toLowerCase(); // Converte para minúsculas

        const searchString = normalizeString(item.titulo);
      const normalizedSearch = normalizeString(searchTerm);
      return searchString.includes(normalizedSearch);
    });

      const filteredItemsEspeciais = itemsEspeciais.filter(item => {
                const normalizeString = (str:any) => str
                .normalize("NFD") // Decompõe os caracteres acentuados
                .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos
                .toLowerCase(); // Converte para minúsculas
    
                const searchString = normalizeString(item.titulo);
              const normalizedSearch = normalizeString(searchTerm);
              return searchString.includes(normalizedSearch);
            });

    return(
        <DropdownMenu open={showDropdown} onOpenChange={() => setShowDropdown(!showDropdown)}>
        <DropdownMenuTrigger className="h-fit">
        <Button variant={'ghost'} size={'icon'} className="h-8 w-8">
                  <Plus size={16}/>
              </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
        <Input
              onChange={(e) => setSearchTerm(e.target.value)}
           
              className="mb-1" placeholder="Pesquisar..."/>
        {filteredItems.length != 0 && (
          <div>
              <DropdownMenuLabel>Elementos</DropdownMenuLabel>
              <DropdownMenuSeparator />
          </div>
        )}
       
        {filteredItems.map((item, index) => (
<div 
className="cursor-pointer rounded-md " 
onClick={() => {
  setShowDropdown(false)
  addContentItem(item.type, (props.number+1))
}}
>
<AddItemDropdown
key={index} 
titulo={item.titulo} 
desc={item.desc} 
chidren={item.icon} 
/>
</div>
))}


{filteredItemsEspeciais.length != 0 && (
                    <div>
                        <DropdownMenuLabel>Funções</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </div>
                  )}
                 
                  {filteredItemsEspeciais.map((item, index) => (
        <div 
        className="cursor-pointer rounded-md " 
        onClick={() => {
            setShowDropdown(false)
            addContentItem(item.type, (props.number+1));
            setSearchTerm('')
        }}
        >
         <AddItemDropdown 
          key={index} 
          titulo={item.titulo} 
          desc={item.desc} 
          chidren={item.icon} 
        />
       </div>
      ))}
          </DropdownMenuContent>
          </DropdownMenu>
    )
}