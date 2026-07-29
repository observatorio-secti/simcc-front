import { useEffect, useMemo, useRef, useState } from "react";

import { useModalSecundary } from "../hooks/use-modal-store-secundary";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { FacebookLogo, LinkedinLogo, WhatsappLogo, EnvelopeSimple } from "phosphor-react";
import { XLogoIcon } from "@phosphor-icons/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const stripHtml = (value?: string) => {
  if (!value) return "";

  const div = document.createElement("div");
  div.innerHTML = value;
  const text = div.textContent || div.innerText || "";

  return text.replace(/\s+/g, " ").trim();
};

const normalizeText = (value?: string) => {
  const text = stripHtml(value);
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const truncateWithEllipsis = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
};

export function ShareArticleModal() {
  const { isOpen, type, onClose, data } = useModalSecundary();
  const isModalOpen = isOpen && type === "share-article";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  const shareTarget = useMemo(() => {
    if (data.doi && data.doi.trim() !== "" && data.doi !== "None") {
      const normalizedDoi = data.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
      return `https://doi.org/${normalizedDoi}`;
    }

    if (data.landing_page_url && data.landing_page_url.trim() !== "" && data.landing_page_url !== "None") {
      return data.landing_page_url;
    }

    const title = data.title || "";
    return `${window.location.origin}/resultados?type_search=article&terms=${encodeURIComponent(title)}&tab=articles-home`;
  }, [data.doi, data.landing_page_url, data.title]);

  const shareMessage = useMemo(() => {
    const title = normalizeText(data.title) || "Artigo";
    const revista = normalizeText(data.magazine) || "Revista não informada";
    const year = data.year || "";
    const qualis = data.qualis && data.qualis !== "None" ? data.qualis : "";
    const researcher = normalizeText(data.researcher) || "";

    const lines = [`${revista}`, `${title}`];

    if (year) {
      lines.push(`${year}`);
    }

    if (qualis) {
      lines.push(`Qualis ${qualis}`);
    }

    if (researcher) {
      lines.push(`${researcher}`);
    }

    return lines.join("\n");
  }, [data.magazine, data.qualis, data.researcher, data.title, data.year, shareTarget]);

  const shareLinks = useMemo(() => {
    const encodedUrl = encodeURIComponent(shareTarget);
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedTitle = encodeURIComponent(normalizeText(data.title) || "Artigo");

    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareMessage}\n\n${shareTarget}`)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedMessage}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      email: `mailto:?subject=${encodeURIComponent(`Artigo: ${data.title || "Compartilhamento"}`)}&body=${encodeURIComponent(`${shareMessage}\n\n${shareTarget}`)}`,
    };
  }, [data.title, shareMessage, shareTarget]);

  useEffect(() => {
    const checkOverflow = () => {
      const element = scrollRef.current;
      if (!element) return;
      setHasOverflow(element.scrollWidth > element.clientWidth + 1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [isModalOpen]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareTarget);
      toast("Link copiado com sucesso", {
        description: "O link do artigo foi copiado para a área de transferência.",
        action: {
          label: "Fechar",
          onClick: () => {},
        },
      });
    } catch (error) {
      console.error(error);
      toast("Não foi possível copiar o link", {
        description: "Tente novamente em instantes.",
        action: {
          label: "Fechar",
          onClick: () => {},
        },
      });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-xl max-h-[calc(100dvh-1rem)] gap-5 overflow-y-auto rounded-2xl p-0">
        <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
          <DialogHeader className="text-left">
            <DialogTitle>Compartilhar</DialogTitle>
          </DialogHeader>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
        </div>

        <div className="space-y-5 px-4 pb-4 pt-1 sm:px-6 sm:pb-6">
          <div className="relative">
            {hasOverflow && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 rounded-full border shadow-sm sm:flex"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 rounded-full border shadow-sm sm:flex"
                >
                  <ChevronRight size={16} />
                </Button>
              </>
            )}

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x hide-scrollbar px-2 py-2 sm:px-11 [&::-webkit-scrollbar]:hidden"
            >
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-[72px] flex-col items-center gap-2 snap-start"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:bg-green-500/15">
                  <WhatsappLogo size={24} />
                </span>
                <span className="text-xs text-center text-muted-foreground">WhatsApp</span>
              </a>

              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-[72px] flex-col items-center gap-2 snap-start"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:bg-sky-500/15">
                  <LinkedinLogo size={24} />
                </span>
                <span className="text-xs text-center text-muted-foreground">LinkedIn</span>
              </a>

              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-[72px] flex-col items-center gap-2 snap-start"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                  <XLogoIcon size={22} weight="bold" />
                </span>
                <span className="text-xs text-center text-muted-foreground">X</span>
              </a>

              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-[72px] flex-col items-center gap-2 snap-start"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/10 text-blue-700 dark:bg-blue-500/15">
                  <FacebookLogo size={24} />
                </span>
                <span className="text-xs text-center text-muted-foreground">Facebook</span>
              </a>

              <a
                href={shareLinks.email}
                className="flex min-w-[72px] flex-col items-center gap-2 snap-start"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/15">
                  <EnvelopeSimple size={24} />
                </span>
                <span className="text-xs text-center text-muted-foreground">E-mail</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-stretch overflow-hidden rounded-2xl border bg-background shadow-sm sm:flex-row sm:rounded-full">
            <Input
              readOnly
              value={shareTarget}
              title={shareTarget}
              className="min-w-0 flex-1 border-0 bg-transparent px-4 py-6 text-sm shadow-none outline-none focus-visible:ring-0 sm:rounded-none sm:rounded-l-full"
            />
            <Button
              onClick={handleCopy}
              variant="default"
              className="h-auto rounded-none rounded-b-2xl px-6 py-3 font-semibold sm:rounded-none sm:rounded-r-full"
            >
              Copiar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}