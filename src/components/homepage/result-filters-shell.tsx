import { ReactNode, useState } from "react";
import { cn } from "../../lib/utils";
import { SlidersHorizontal, Trash, X } from "lucide-react";
import { FadersHorizontal } from "phosphor-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent } from "../ui/sheet";
import { DialogFooter, DialogHeader } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useModal } from "../hooks/use-modal-store";
import { useMediaQueryLg } from "../hooks/use-media-query-lg";
import bg_user from '../../assets/user.png';

type ResultFiltersSidebarProps = {
    title?: string;
    onClear: () => void;
    children: ReactNode;
};

export function ResultFiltersSidebar({ title = "Filtros", onClear, children }: ResultFiltersSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={cn(
                "group relative hidden lg:block shrink-0 sticky top-[68px] h-[calc(100vh-116px)] transition-[width] duration-200 ease-linear",
                collapsed ? "w-4" : "w-72"
            )}
            data-state={collapsed ? "collapsed" : "expanded"}
            data-side="left"
        >
            <aside className="h-full overflow-hidden">
                <div className="h-full w-72 overflow-y-auto border-r border-neutral-200 bg-card p-4 dark:border-neutral-800">
                    <div className="mb-4 mt-2">
                        <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold leading-tight tracking-tighter">
                            <SlidersHorizontal size={24} />
                            {title}
                        </h1>
                    </div>

                    {children}

                    <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                        <Button variant="ghost" onClick={onClear} className="gap-2 w-full">
                            <Trash size={16} />
                            Limpar Filtros
                        </Button>
                    </div>
                </div>
            </aside>

            <button
                onClick={() => setCollapsed((c) => !c)}
                aria-label="Ocultar ou mostrar filtros"
                tabIndex={-1}
                title="Ocultar ou mostrar filtros"
                className={cn(
                    "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border lg:flex -right-4",
                    collapsed
                        ? "cursor-e-resize after:bg-sidebar-border"
                        : "cursor-w-resize"
                )}
            />
        </div>
    );
}

type ResultFiltersSheetProps = {
    title?: string;
    onClear: () => void;
    onApply: () => void;
    filteredCount: number;
    children: ReactNode;
};

export function ResultFiltersSheet({ title = "Filtros", onClear, onApply, filteredCount, children }: ResultFiltersSheetProps) {
    const { onClose, isOpen, type: typeModal } = useModal();
    const isModalOpen = isOpen && typeModal === "filters";
    const isDesktop = useMediaQueryLg();

    return (
        <Sheet open={isModalOpen && !isDesktop} onOpenChange={onClose}>
            <SheetContent className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[60vw]`}>
                <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-gray-600">

                    <div className="flex items-center gap-3">

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button className="h-8 w-8" variant={'outline'} onClick={() => {
                                        onClose()
                                    }} size={'icon'}><X size={16} /></Button>
                                </TooltipTrigger>
                                <TooltipContent> Fechar</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                </DialogHeader>

                <div className="relative flex">

                    <div>
                        <div className="hidden lg:block p-8 pr-0 h-full">
                            <div style={{ backgroundImage: `url(${bg_user})` }} className=" h-full w-[270px]  bg-cover bg-no-repeat bg-left rounded-md bg-eng-blue p-8"></div>

                        </div>

                    </div>
                    <div className="relative h-[calc(100vh-50px)] p-8 w-full overflow-y-auto">
                        <div>
                            <h1 className="mb-8 flex items-center gap-3 max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]">
                                <SlidersHorizontal size={32} className="shrink-0" />
                                {title}
                            </h1>
                        </div>

                        <div className="w-full">
                            {children}
                        </div>

                        <DialogFooter className="py-4">
                            <Button variant="ghost" onClick={onClear} className="gap-2">
                                <Trash size={16} />
                                Limpar Filtros
                            </Button>

                            <Button onClick={() => { onApply(); onClose(); }} className="gap-2">
                                <FadersHorizontal size={16} />
                                Mostrar {filteredCount} resultados
                            </Button>
                        </DialogFooter>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}