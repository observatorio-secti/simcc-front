import React from 'react';
import { Tailwind } from '@react-email/tailwind';
import { Html, Body, Head, Container, Heading, Text, Link, Button } from '@react-email/components';

const img_1 = 'https://example.com/images/logo_email_1.png';
const img_2 = 'https://example.com/images/logo_email_2.png';
const img_3 = 'https://example.com/images/logo_email_3.png';
const img_4 = 'https://example.com/images/bg_home.png';


export function NotificationEmail({ titulo, subTitulo, texto, link }) {
  return (
    <Html>
       <Head>
       

    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com"></link>
<link rel="preconnect" href="https://fonts.gstatic.com" ></link>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet"></link>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');

        .ubuntu-light {
  font-family: "Ubuntu", sans-serif;
  font-weight: 300;
  font-style: normal;
}

.ubuntu-regular {
  font-family: "Ubuntu", sans-serif;
  font-weight: 400;
  font-style: normal;
}

.ubuntu-medium {
  font-family: "Ubuntu", sans-serif;
  font-weight: 500;
  font-style: normal;
}

.ubuntu-bold {
  font-family: "Ubuntu", sans-serif;
  font-weight: 700;
  font-style: normal;
}

.ubuntu-light-italic {
  font-family: "Ubuntu", sans-serif;
  font-weight: 300;
  font-style: italic;
}

.ubuntu-regular-italic {
  font-family: "Ubuntu", sans-serif;
  font-weight: 400;
  font-style: italic;
}

.ubuntu-medium-italic {
  font-family: "Ubuntu", sans-serif;
  font-weight: 500;
  font-style: italic;
}

.ubuntu-bold-italic {
  font-family: "Ubuntu", sans-serif;
  font-weight: 700;
  font-style: italic;
}
          body {
            font-family: 'Ubuntu', sans-serif;
          }
        `}</style>
      </Head>
      <Tailwind>
        <Body className="bg-neutral-50 p-4">
          <div id="layout_email" className="w-full bg-neutral-50">
            <div className="bg-cover z-0 bg-center bg-no-repeat h-64 rounded-t-md bg-[#415F71] w-full" style={{ backgroundImage: `url(${img_3})` }}></div>
            <div className="max-w-[900px] mx-auto py-8 z-2 relative -top-56">
              <div className="bg-[#719CB8] p-8 w-full rounded-t-md">
                <img src={img_1} className="h-16" alt="Logo" />
              </div>
              <div className="border bg-white border-neutral-200 w-full rounded-b-md p-8">
                <Heading className="font-medium text-3xl">{titulo.length !== 0 ? titulo : 'Insira o título'}</Heading>
                <Text className="text-gray-500">{subTitulo.length !== 0 ? subTitulo : 'Insira o subtítulo'}</Text>
                <Text className="py-12 text-gray-500">{texto.length !== 0 ? texto : 'Insira o corpo da mensagem'}</Text>
                <div className="mt-8">
                  <Link href={link} target="_blank" rel="noopener noreferrer">
                    <Button className="text-neutral-50 hover:bg-[#274B5E] cursor-pointer bg-[#719CB8] text-white px-4 py-2 rounded-md inline-flex gap-3 leading-none no-underline outline-none items-center justify-center whitespace-nowrap rounded-md text-sm font-medium  transition-colors focus-visible:outline-none  disabled:pointer-events-none disabled:opacity-50">
                    <i className="ph ph-arrow-square-out text-white w-4 h-4"></i> Ir à página
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="pt-4">
                <Text className="text-gray-500 text-xs flex gap-2">
                  Você está recebendo este e-mail porque está inscrito na Newsletter do{' '}
                  <Link href="https://conectee.eng.ufmg.br/" className="text-blue-500" target="_blank" rel="noopener noreferrer">
                    Conectee
                  </Link>{' '}
                  |{' '}
                  <Link href="https://www.eng.ufmg.br/" className="text-blue-500" target="_blank" rel="noopener noreferrer">
                    Escola de Engenharia
                  </Link>
                </Text>
                <div className="mt-4 flex gap-4 items-center">
                  <img src={img_4} className="h-8" alt="Logo" />
                  <img src={img_2} className="h-8" alt="Logo" />
                </div>
              </div>
            </div>
          </div>
        </Body>
      </Tailwind>
    </Html>
  );
}
