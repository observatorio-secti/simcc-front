"use client";

import { useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Smile } from "lucide-react";
import { Button } from "../../ui/button";
import { useTheme } from "next-themes";

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    contentItem:any
  }
  export function EmojiPicker({ onSelect, contentItem }: EmojiPickerProps) {
    const [open, setOpen] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
      const {theme} = useTheme()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
      <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex min-w-8"
                     
                     
                    >
                     {contentItem.emoji != '' ? <span className="text-lg">{contentItem.emoji}</span> : <Smile size={16} />}
                    </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
      <Picker
          data={data}
          onEmojiSelect={(emoji: any) => {
            onSelect(emoji.native); // Corrigido: usa 'emoji.native' corretamente
            setSelectedEmoji(emoji.native);
            setOpen(false);
          }}
          theme={theme == 'dark' ? 'dark':"light"}
        />
      </PopoverContent>
    </Popover>
  );
}
