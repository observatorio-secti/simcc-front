// src/components/EnviarNotificacoes.jsx
import React, { useContext, useState } from 'react';
import { ChevronLeft, Send, SquareArrowOutUpRight } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import img_1 from '../../assets/logo_email_1.png';
import img_2 from '../../assets/logo_email_2.png';
import img_3 from '../../assets/bg_home.png';
import img_4 from '../../assets/logo_email_3.png';
import { render } from '@react-email/render';
import { NotificationEmail } from './notificacao';
import { Helmet } from 'react-helmet';
import { UserContext } from '../../context/context';

export function EnviarNotificacoes() {
    const navigate = useNavigate();
    const [link, setLink] = useState('');
    const [titulo, setTitulo] = useState('');
    const [subTitulo, setSubTitulo] = useState('');
    const [texto, setTexto] = useState('');

    const handleVoltar = () => {
        navigate(-1);
    }

    const handleEnviarEmails = async () => {
        const emailHtml = render(
            <NotificationEmail
                titulo={titulo}
                subTitulo={subTitulo}
                texto={texto}
                link={link}
            />
        );

        try {
            const response = await fetch('https://simcc.uesc.br/v3/node/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ html: emailHtml }),
            });

            if (response.ok) {
                setLink('')
                setSubTitulo('')
                setTexto('')
                setTitulo('')

                toast("Email enviado", {
                    description: "Sua solicitação chegará na caixa de entrada de todos os usuários cadastrados",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
            } else {

            }
        } catch (error) {
            console.error('Erro ao enviar email:', error);

        }
    };

    const { version } = useContext(UserContext)

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            <Helmet>
                <title>Enviar notificações | Módulo administrativo | {version ? ('Conectee') : ('Simcc')} </title>
                <meta name="description" content={`Enviar notificações | Módulo administrativo | ${version ? ('Conectee') : ('Simcc')}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>
            <div className="w-full gap-4">
                <div className="flex items-center gap-4">
                    <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Enviar notificações
                    </h1>
                    <div className="hidden items-center gap-2 md:ml-auto md:flex">
                        <Button size="sm" onClick={() => handleEnviarEmails()}>
                            <Send size={16} /> Enviar emails
                        </Button>
                    </div>
                </div>
            </div>
            <div className="grid mt-4 grid-cols-3 gap-4 md:gap-8 h-full">
                <div className="flex flex-col gap-8">
                    <fieldset className="grid gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 bg-cover bg-center bg-no-repeat">
                        <legend className="-ml-1 px-1 text-sm font-medium">Informações</legend>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="titulo">Título</Label>
                                <Input
                                    name="titulo"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    id="titulo"
                                    type="text"
                                    className="flex flex-1"
                                />
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="subtitulo">Subtítulo</Label>
                                <Input
                                    name="subtitulo"
                                    value={subTitulo}
                                    onChange={(e) => setSubTitulo(e.target.value)}
                                    id="subtitulo"
                                    type="text"
                                    className="flex flex-1"
                                />
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="texto">Corpo da mensagem</Label>
                                <Textarea
                                    name="texto"
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                    className="flex flex-1"
                                />
                            </div>
                            <div className="grid gap-3 w-full">
                                <Label htmlFor="link">Link</Label>
                                <Input
                                    name="link"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    id="link"
                                    type="text"
                                    className="flex flex-1"
                                />
                            </div>
                        </div>
                    </fieldset>
                    <fieldset className="grid gap-6 rounded-lg p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 bg-cover bg-center bg-no-repeat">
                        <legend className="-ml-1 px-1 text-sm font-medium">Configurações</legend>
                    </fieldset>
                </div>
                <div className="flex lg:col-span-2 rounded-md border dark:border-neutral-800">
                    <ScrollArea className="w-full">
                        <div id="layout_email" className="w-full bg-neutral-50">
                            <div className="bg-cover z-[0] bg-center bg-no-repeat h-64  rounded-t-md bg-eng-dark-blue w-full" style={{ backgroundImage: `url(${img_3})` }}></div>
                            <div className="max-w-[650px] mx-auto py-8 z-[2] relative -top-56">
                                <div className="bg-eng-blue p-8 w-full rounded-t-md">
                                    <img src={img_1} className="h-16" alt="Logo" />
                                </div>
                                <div className="border bg-white border-neutral-200 rounded-b-md p-8">
                                    <h1 className="font-medium text-3xl">{titulo.length !== 0 ? titulo : 'Insira o título'}</h1>
                                    <p className="text-gray-500">{subTitulo.length !== 0 ? subTitulo : 'Insira o subtítulo'}</p>
                                    <p className="py-12 flex relative text-gray-500">{texto.length !== 0 ? texto : 'Insira o corpo da mensagem'}</p>
                                    {link.length > 0 && (
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                            <Button>
                                                <SquareArrowOutUpRight size={16} /> Ir à página
                                            </Button>
                                        </a>
                                    )}
                                </div>
                                <div className="pt-4">
                                    <p className="text-gray-500 text-xs flex gap-1">
                                        Você está recebendo este e-mail porque está inscrito na Newsletter do{' '}
                                        <a href="https://conectee.eng.ufmg.br/" target="_blank" rel="noopener noreferrer">
                                            Conectee
                                        </a>{' '}
                                        |{' '}
                                        <a href="https://www.eng.ufmg.br/" target="_blank" rel="noopener noreferrer">
                                            Escola de Engenharia
                                        </a>
                                    </p>
                                    <div className="mt-4 flex gap-4 items-center">
                                        <img src={img_4} className="h-8" alt="Logo" />
                                        <img src={img_2} className="h-8" alt="Logo" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </main>
    );
}
