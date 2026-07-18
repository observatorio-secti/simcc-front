import { useContext, useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Autoplay from "embla-carousel-autoplay"
import { Alert } from "../../ui/alert";
import { CardContent } from "../../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../ui/carousel";
import { Button } from "../../ui/button";
import { Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { UserContext } from "../../../context/context";

interface Banner {
  id: string;
  titulo: string;
  imgURL: string;
  descricao?: string;
  botao?: string;
  link?: string;
  color:string
  textColor:string
}

export function BannerHome() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const {version} = useContext(UserContext)
  useEffect(() => {
    const fetchBanners = async () => {
      const db = getFirestore();
      const bannersRef = collection(db, (version ? ("background"):("background_iapos")));
      const snapshot = await getDocs(bannersRef);
      const bannersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Banner[];

      setBanners(bannersData);
    };

    fetchBanners();
  }, []);

  return (
    <div className="flex w-full relative">
      <Carousel 
       opts={{
        align: "start",
        loop: true,
      }}

       plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      onChange={(index) => setCurrentIndex(Number(index))}
      className="w-full flex items-center">
        <CarouselContent>
          {banners.length > 0 ? (
            banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div className="">
                  <Alert
                   style={{
                       
                      
                    backgroundColor: banner.color // Define a cor de fundo
                  }} className="p-0 rounded-md grid lg:grid-cols-2">
                    <CardContent
                      className="flex rounded-t-md lg:rounded-tr-none lg:rounded-l-md h-[300px] items-center  p-16 bg-cover bg-center"
                     
                    >

                      <div className="flex z-[2] flex-col gap-3">
                        <h1  style={{
                       
                       color: banner.textColor,  // Define a cor do texto
                  
                     }} className="text-2xl font-medium">
                          {banner.titulo}
                        </h1>

                       {banner.descricao && (
                         <p style={{
                       
                          color: banner.textColor,  // Define a cor do texto
                     
                        }} 
                        className=" ">
                         {banner.descricao}
                       </p>
                       )}

                       {banner.link && (
                        <Link className="w-fit" to={banner.link} target="_blank">
                          <Button style={{
  color: banner.textColor,  // Define a cor do texto
  border: `1px solid ${banner.textColor}`, // Corrigido: usa template literals para concatenar o valor da cor com a unidade
}}
                     className="bg-transparent hover:bg-transparent dark:hover:bg-transparent dark:bg-transparent" variant={'outline'}>
                        <Link2 size={16}/> {banner.botao}
                      </Button></Link>
                       )}
                      </div>
                     
                    </CardContent>

                    <div className="bg-no-repeat h-[300px] bg-cover bg-center rounded-b-md lg:rounded-bl-none lg:rounded-r-md"  style={{
    backgroundImage: `url(${banner.imgURL})`,

  }}>

                    </div>
                  </Alert>
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="p-1">
                <Alert>
                  <CardContent className="flex h-[300px] items-center justify-center p-6">
                    <span className="text-4xl font-semibold">Carregando...</span>
                  </CardContent>
                </Alert>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>

        <div className="w-full absolute bottom-0 ml-auto gap-3 right-0 float-right  flex p-8">
          <div className="ml-auto flex gap-3 items-center">
          <CarouselPrevious className="rounded-md" />
         <p className="font-medium text-sm text-white"> {currentIndex + 1} / {banners.length}</p>
          <CarouselNext  className="rounded-md"/>
          </div>
        </div>
      </Carousel>
    </div>
  );
}
