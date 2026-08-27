import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from "@/i18n";
import { useTheme } from "@/components/theme-context";

export function LanguageSwitcher({ compact = false }) {
    const { lang, changeLanguage } = useLanguage();
    const { theme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={theme === "dark" ? "default" : "secondary"}
                    size={compact ? "icon" : "sm"}
                    className="flex items-center gap-1.5 font-bold text-xs px-3"
                    aria-label="Select language"
                >
                    <Globe className="h-4 w-4" />
                    {!compact && <span>{LANGUAGE_NAMES[lang] || lang.toUpperCase()}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                    Language
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SUPPORTED_LANGUAGES.map((code) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => changeLanguage(code)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        <span>{LANGUAGE_NAMES[code]}</span>
                        {lang === code && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
