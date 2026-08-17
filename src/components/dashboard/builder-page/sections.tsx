import { Keepo } from './builder-page';
import { Social } from './sections/social';
import { LinkSection } from './sections/link';
import { FileSection } from './sections/file';
import { H1Section } from './sections/h1';
import { H2Section } from './sections/h2';
import { SeparatorSection } from './sections/separator';
import { H3Section } from './sections/h3';
import { TextSection } from './sections/text';
import { VideoSection } from './sections/video';
import { useEffect } from 'react';
import { ListSection } from './sections/list';
import { ListNumberSection } from './sections/list-number';
import { GraficoSection } from './sections/grafico';
import { TabelaSection } from './sections/tabela';
import { NuvemPalavraSection } from './sections/nuvem-palavra';
import { ArtigosSection } from './sections/artigos';
import { HtmlSection } from './sections/html';
import { BotoesSection } from './sections/botoes';
import { ImageSection } from './sections/image';
import { CardSection } from './sections/card';
import { CarrosselSection } from './sections/carrossel';

interface Props {
  keepoData: Keepo;
  setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
}

export function SectionBuilderPage(props: Props) {
  const moveItem = (index: number, direction: 'up' | 'down') => {
    props.setKeepoData((prev) => {
      const newContent = [...prev.content]; // Cria uma cópia do array
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      // Garante que o índice alvo está dentro dos limites do array
      if (targetIndex < 0 || targetIndex >= newContent.length) return prev;

      // Realiza a troca dos elementos mantendo todas as propriedades
      [newContent[index], newContent[targetIndex]] = [
        newContent[targetIndex],
        newContent[index],
      ];

      return { ...prev, content: newContent }; // Retorna o estado atualizado
    });
  };

  // Função para remover um item da lista
  const deleteItem = (index: number) => {
    props.setKeepoData((prev) => {
      const newContent = prev.content.filter((_, i) => i !== index);
      return { ...prev, content: newContent };
    });
  };

  useEffect(() => {
    console.log(props.keepoData);
  }, [props.keepoData]);

  return (
    <div className="flex flex-col gap-2 mb-2">
      {props.keepoData.content.map((contentItem, index) => (
        <div key={index} className="">
          {(() => {
            switch (contentItem.type) {
              case 'divider':
                return (
                  <SeparatorSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'h1':
                return (
                  <H1Section
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'h2':
                return (
                  <H2Section
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );

              case 'h3':
                return (
                  <H3Section
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );

              case 'text':
                return (
                  <TextSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'list':
                return (
                  <ListSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'list-number':
                return (
                  <ListNumberSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'video':
                return (
                  <VideoSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'link':
                return (
                  <LinkSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'file':
                return (
                  <FileSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'social':
                return (
                  <Social
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'grafico':
                return (
                  <GraficoSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'tabela':
                return (
                  <TabelaSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'nuvem-palavra':
                return (
                  <NuvemPalavraSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'artigos':
                return (
                  <ArtigosSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'html':
                return (
                  <HtmlSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'botoes':
                return (
                  <BotoesSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'image':
                return (
                  <ImageSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'card':
                return (
                  <CardSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              case 'slider':
                return (
                  <CarrosselSection
                    contentItem={contentItem}
                    setKeepoData={props.setKeepoData}
                    moveItem={moveItem}
                    deleteItem={deleteItem}
                    index={index}
                    keepoData={props.keepoData}
                  />
                );
              default:
                return <span>Elemento não reconhecido</span>;
            }
          })()}
        </div>
      ))}
    </div>
  );
}
