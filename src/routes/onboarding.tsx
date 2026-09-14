import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Linkedin,
  ArrowRight,
  Download,
  Upload,
  FileText,
  Globe,
  Sparkles,
  Plus,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import {
  LINKEDIN_URL_REGEX,
  WEBSITE_URL_REGEX,
  WEBSITE_ANALYSIS_STEPS,
  ICP_INDUSTRY_OPTIONS,
  ICP_LOCATION_OPTIONS,
  ICP_PERSONA_OPTIONS,
  ICP_COMPANY_SIZE_OPTIONS,
  PROCESSING_STEPS,
  suggestPreIcp,
  
  loadOnboarding,
  saveOnboarding,
  loadUser,
  saveUser,
  makeInitialTasks,
  type ChatMessage,
  type OnboardingData,
  type IcpProfile,
} from "@/lib/onboarding-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Isla" },
      { name: "description", content: "Guided workspace setup." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function useStreamingText(target: string, speed = 14) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!target) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [target, speed]);
  return shown;
}

function IslaMark({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 960 925" fill="none" className={className}>
      <path d="M536.142 100.408C617.823 97.3663 698.237 109.907 743.553 186.745C756.025 213.541 775.181 225.944 789.001 234.891C793.956 238.099 798.226 240.863 801.255 243.687C806.547 248.768 822.139 257.196 838.854 266.23C860.509 277.935 884.049 290.657 889.513 298.438C935.357 362.84 941.558 400.973 939.736 478.121C924.704 552.361 864.077 728.198 741.826 837.625C667.606 878.783 603.995 909.886 519.418 903.391C517.088 903.234 514.745 903.081 512.393 902.928C495.809 901.845 478.784 900.733 462.601 897.943C448.638 895.856 435.057 892.397 421.46 888.934C413.603 886.934 405.74 884.931 397.794 883.191C393.115 882.167 388.502 881.167 383.95 880.18C312.138 864.608 255.563 852.34 197.169 799.905C186.247 790.098 177.864 778.594 169.309 766.854C168.365 765.559 167.418 764.26 166.466 762.961C130.765 714.231 103.943 660.403 100.591 599.023C99.1833 573.235 100.269 545.83 104.066 520.261C105.214 512.527 106.757 504.852 108.298 497.179C109.433 491.532 110.567 485.885 111.545 480.216C112.767 473.126 114.01 466.033 115.255 458.936C120.316 430.063 125.388 401.13 129.096 372.092C131.388 354.152 132.749 336.234 134.117 318.246C134.36 315.045 134.604 311.841 134.853 308.635C135.019 306.497 135.177 304.355 135.335 302.213C136.393 287.821 137.456 273.36 141.168 259.384C146.922 237.711 157.833 215.982 172.88 199.276C248.503 115.318 410.692 106.912 524.641 101.007C528.533 100.805 532.369 100.607 536.142 100.408ZM555.762 203.891C476.003 153.946 378.379 114.173 298.817 164.432C181.783 238.364 127.873 357.796 169.755 514.099C203.015 638.229 260.425 729.632 324.502 798.629C425.379 907.252 603.535 847.893 708.123 742.837C817.866 632.602 923.863 546.139 887.856 411.759C841.921 240.326 720.719 307.186 555.762 203.891Z" fill="currentColor"/>
    </svg>
  );
}

function IslaWordmark({ className }: { className?: string }) {
  return (
    <svg width="81" height="31" viewBox="0 0 81 31" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16.2572 1.97943C18.9336 1.87977 21.5685 2.29069 23.0534 4.80844C23.4621 5.68647 24.0898 6.09288 24.5426 6.38605C24.705 6.49116 24.8449 6.58173 24.9441 6.67427C25.1175 6.84076 25.6284 7.11692 26.1761 7.41293C26.8857 7.79647 27.6571 8.21333 27.8361 8.4683C29.3383 10.5786 29.5415 11.8281 29.4818 14.356C28.9892 16.7886 27.0026 22.5503 22.9968 26.1359C20.5649 27.4845 18.4805 28.5037 15.7092 28.2908C15.6328 28.2857 15.556 28.2807 15.479 28.2757C14.9356 28.2402 14.3777 28.2037 13.8474 28.1123C13.3899 28.0439 12.9449 27.9306 12.4994 27.8171C12.2419 27.7516 11.9843 27.6859 11.7239 27.6289C11.5706 27.5954 11.4194 27.5626 11.2703 27.5303C8.91721 27.02 7.06342 26.618 5.15002 24.8999C4.79213 24.5786 4.51745 24.2016 4.23712 23.8169C4.20619 23.7745 4.17516 23.7319 4.14397 23.6894C2.97415 22.0926 2.09527 20.3288 1.98544 18.3176C1.93931 17.4726 1.97489 16.5746 2.0993 15.7368C2.13692 15.4834 2.18748 15.2319 2.23797 14.9805C2.27516 14.7954 2.31232 14.6104 2.34437 14.4246C2.38441 14.1923 2.42514 13.9599 2.46593 13.7273C2.63177 12.7813 2.79796 11.8332 2.91946 10.8817C2.99456 10.2939 3.03916 9.70676 3.08399 9.11735C3.09195 9.01246 3.09994 8.90747 3.1081 8.80242C3.11354 8.73237 3.11872 8.66218 3.1239 8.59199C3.15856 8.12041 3.1934 7.64656 3.31503 7.18861C3.50357 6.47845 3.86109 5.76645 4.35414 5.21905C6.83208 2.46799 12.1465 2.19255 15.8803 1.99906C16.0078 1.99244 16.1335 1.98596 16.2572 1.97943ZM16.9001 5.37027C14.2866 3.73372 11.0877 2.43047 8.48072 4.07731C4.64586 6.49985 2.87939 10.4133 4.25174 15.5349C5.34157 19.6022 7.22273 22.5973 9.32234 24.8581C12.6278 28.4173 18.4654 26.4723 21.8925 23.0299C25.4884 19.4179 28.9616 16.5847 27.7818 12.1815C26.2766 6.56414 22.3052 8.75494 16.9001 5.37027Z" fill="currentColor"/>
      <path d="M34.7334 26.7631V11.2273H38.9046V26.7631H34.7334Z" fill="currentColor"/>
      <path d="M55.5605 13.7424L51.7578 14.1573C51.6504 13.7732 51.462 13.4121 51.1933 13.0741C50.9321 12.7361 50.5786 12.4634 50.1333 12.256C49.6876 12.0486 49.142 11.9449 48.4969 11.9449C47.6289 11.9449 46.8991 12.1331 46.3074 12.5095C45.7238 12.8859 45.4358 13.3737 45.4433 13.9729C45.4358 14.4876 45.6238 14.9063 46.0079 15.2289C46.3998 15.5515 47.045 15.8166 47.9438 16.024L50.9629 16.6693C52.6373 17.0303 53.8818 17.6026 54.6961 18.3862C55.5182 19.1697 55.933 20.1953 55.9406 21.4628C55.933 22.5766 55.6063 23.5599 54.9611 24.4126C54.3235 25.2576 53.4362 25.9183 52.2995 26.3945C51.1625 26.8708 49.8567 27.1089 48.3815 27.1089C46.2153 27.1089 44.4714 26.6557 43.1503 25.7492C41.8291 24.8351 41.0417 23.5638 40.7881 21.9352L44.8558 21.5434C45.0399 22.3423 45.4318 22.9454 46.0311 23.3525C46.6301 23.7596 47.41 23.9632 48.3701 23.9632C49.3609 23.9632 50.1562 23.7596 50.7555 23.3525C51.3623 22.9454 51.6658 22.4422 51.6658 21.843C51.6658 21.336 51.4698 20.9173 51.0779 20.587C50.6939 20.2567 50.0946 20.0032 49.2803 19.8265L46.2615 19.1928C44.5638 18.8394 43.3079 18.244 42.4936 17.4067C41.6793 16.5617 41.276 15.4939 41.2835 14.2034C41.276 13.1125 41.5715 12.1677 42.1709 11.3688C42.7777 10.5621 43.6188 9.93992 44.6942 9.50206C45.7775 9.05649 47.026 8.83374 48.4392 8.83374C50.5134 8.83374 52.1458 9.27544 53.3366 10.1588C54.5349 11.0423 55.276 12.2368 55.5605 13.7424Z" fill="currentColor"/>
      <path d="M61.9291 3.16479V26.7636H57.7578V3.16479H61.9291Z" fill="currentColor"/>
      <path d="M69.689 27.1205C68.5677 27.1205 67.5575 26.9207 66.6587 26.5213C65.7674 26.1141 65.0607 25.515 64.5383 24.7237C64.0239 23.9325 63.7664 22.9569 63.7664 21.7969C63.7664 20.7983 63.9508 19.9725 64.3195 19.3195C64.6881 18.6665 65.1914 18.1442 65.829 17.7524C66.4667 17.3606 67.1849 17.0649 67.9838 16.8651C68.7902 16.6577 69.6238 16.508 70.4843 16.4157C71.5213 16.3082 72.3625 16.2122 73.0077 16.1277C73.6532 16.0355 74.1217 15.8972 74.4134 15.7129C74.7132 15.5208 74.8629 15.2251 74.8629 14.8256V14.7565C74.8629 13.8884 74.6057 13.2162 74.0909 12.74C73.5762 12.2637 72.835 12.0255 71.867 12.0255C70.8454 12.0255 70.0347 12.2483 69.4357 12.6939C68.8443 13.1394 68.4448 13.6656 68.2374 14.2725L64.3424 13.7194C64.6498 12.6439 65.157 11.7452 65.8634 11.0231C66.5702 10.2933 67.4346 9.74788 68.4563 9.38682C69.478 9.01809 70.6071 8.83374 71.8438 8.83374C72.6967 8.83374 73.5454 8.93358 74.3904 9.13333C75.2355 9.33304 76.0075 9.66337 76.7064 10.1243C77.4056 10.5775 77.9663 11.1959 78.389 11.9794C78.8192 12.763 79.0342 13.7424 79.0342 14.9178V26.7633H75.0241V24.3319H74.8859C74.6326 24.8236 74.2751 25.2845 73.8144 25.7147C73.3612 26.1372 72.7888 26.479 72.0974 26.7402C71.4139 26.9937 70.6111 27.1205 69.689 27.1205ZM70.7723 24.0554C71.6095 24.0554 72.3356 23.8902 72.95 23.5599C73.5647 23.2219 74.0372 22.7764 74.3675 22.2233C74.7053 21.6702 74.8744 21.0671 74.8744 20.4142V18.3286C74.744 18.4361 74.5212 18.536 74.2059 18.6281C73.8989 18.7203 73.5532 18.801 73.1692 18.8701C72.7848 18.9393 72.4047 19.0007 72.0282 19.0545C71.6517 19.1082 71.3254 19.1544 71.0488 19.1928C70.4266 19.2773 69.8696 19.4155 69.378 19.6076C68.8865 19.7996 68.4986 20.0685 68.2142 20.4142C67.9301 20.7522 67.7879 21.19 67.7879 21.7278C67.7879 22.496 68.0683 23.0759 68.629 23.4677C69.19 23.8595 69.9043 24.0554 70.7723 24.0554Z" fill="currentColor"/>
      <path d="M34.7878 5.71875H38.9594V9.89013H34.7878V5.71875Z" fill="currentColor"/>
    </svg>
  );
}

function IslaAvatar({ size = "size-8" }: { size?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full", size)} style={{ backgroundColor: "#111111" }}>
      <IslaMark className="size-4 text-white" />
    </div>
  );
}

function AssistantBubble({ message, streaming }: { message: ChatMessage; streaming?: boolean }) {
  const text = useStreamingText(streaming ? message.content : "", 12);
  const display = streaming ? text : message.content;
  return (
    <div className="flex items-start gap-3">
      <IslaAvatar />
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground">
        {display}
        {streaming && display.length < message.content.length && (
          <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-foreground/60 align-middle" />
        )}
      </div>
    </div>
  );
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-muted px-4 py-2.5 text-sm text-foreground">
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <IslaAvatar />
      <div className="rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="size-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-foreground/60 [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-foreground/60" />
        </div>
      </div>
    </div>
  );
}

const LINKEDIN_EXPORT_URL = "https://www.linkedin.com/analytics/creator/content/";

function ConnectionsUpload({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (f: File | undefined | null) => {
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) return;
    onFile(f);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Linkedin className="size-4 text-foreground" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Export LinkedIn data</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            On LinkedIn Analytics select <strong>365 days</strong>, click <strong>Export</strong>, then drag the CSV file here in the chat.
          </p>
        </div>
      </div>

      <Button asChild size="sm" className="w-full">
        <a href={LINKEDIN_EXPORT_URL} target="_blank" rel="noreferrer noopener">
          <Download className="mr-1 size-3.5" /> Open LinkedIn Analytics
        </a>
      </Button>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          {dragging ? <FileText className="size-4 text-primary" /> : <Upload className="size-4 text-muted-foreground" />}
          <span className="font-medium">
            {dragging ? "Drop to upload" : "Drop your Connections.csv here"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">or click to select a file</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>
    </Card>
  );
}

/* -------------------- Website analysis (reasoning list) -------------------- */

function WebsiteAnalysisCard({
  websiteUrl,
  currentStep,
  done,
}: {
  websiteUrl?: string;
  currentStep: number;
  done: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-md bg-muted">
          <Globe className="size-4 text-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">Pre-configuring your ICP</div>
          <p className="truncate text-xs text-muted-foreground">
            {websiteUrl ? `Reasoning from ${websiteUrl}` : "Reasoning through your inputs to build the right targeting"}
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {WEBSITE_ANALYSIS_STEPS.map((label, i) => {
          const isDone = done || i < currentStep;
          const isActive = !done && i === currentStep;
          const isIdle = !done && i > currentStep;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 text-sm transition-opacity",
                isIdle && "opacity-40",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : isActive ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <div className="size-4 rounded-full border border-border" />
              )}
              <span className={cn("font-medium", isDone && "text-muted-foreground")}>{label}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* -------------------- Pre-ICP builder -------------------- */

function ChipGroup({
  options,
  values,
  onToggle,
  allowAdd,
  onAdd,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  allowAdd?: boolean;
  onAdd?: (v: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (v && onAdd) onAdd(v);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            {opt}
            {active && <X className="ml-1 inline size-3 opacity-70" />}
          </button>
        );
      })}
      {allowAdd && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          <Plus className="mr-1 inline size-3" /> Add
        </button>
      )}
      {allowAdd && adding && (
        <div className="flex items-center gap-1">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft("");
                setAdding(false);
              }
            }}
            onBlur={commit}
            placeholder="Custom..."
            className="h-8 w-32 text-xs"
          />
        </div>
      )}
    </div>
  );
}

/** Shows only the industries detected for the company, with search to add more. */
function IndustryPicker({
  values,
  onToggle,
  onAdd,
}: {
  values: string[];
  onToggle: (v: string) => void;
  onAdd: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = q
    ? ICP_INDUSTRY_OPTIONS.filter(
        (o) => o.toLowerCase().includes(q) && !values.includes(o),
      ).slice(0, 6)
    : [];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
          >
            {opt}
            <X className="ml-1 inline size-3 opacity-70" />
          </button>
        ))}
        {values.length === 0 && (
          <span className="text-xs text-muted-foreground">
            No industry detected yet. Search below.
          </span>
        )}
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && query.trim()) {
            onAdd(results[0] ?? query.trim());
            setQuery("");
          }
        }}
        placeholder="Search industries"
        className="h-8 max-w-xs text-xs"
      />

      {results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {results.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onAdd(opt);
                setQuery("");
              }}
              className="rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <Plus className="mr-1 inline size-3" />
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PreIcpBuilder({

  profile,
  onChange,
  onConfirm,
  aiGenerated,
}: {
  profile: IcpProfile;
  onChange: (p: IcpProfile) => void;
  onConfirm: () => void;
  aiGenerated: boolean;
}) {
  const toggle = (key: keyof IcpProfile, v: string) => {
    const list = (profile[key] as string[]) ?? [];
    onChange({
      ...profile,
      [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v],
    });
  };
  const add = (key: keyof IcpProfile, v: string) => {
    const list = (profile[key] as string[]) ?? [];
    if (list.includes(v)) return;
    onChange({ ...profile, [key]: [...list, v] });
  };

  const canContinue =
    profile.industries.length > 0 &&
    profile.personas.length > 0;


  return (
    <Card className="space-y-6 p-5">
      <div>
        <h3 className="text-lg font-semibold">Who are you targeting?</h3>
      </div>

      {profile.companyDescription !== undefined && (
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Pencil className="size-3" /> Company description
          </label>
          <Textarea
            value={profile.companyDescription}
            onChange={(e) => onChange({ ...profile, companyDescription: e.target.value })}
            rows={2}
            className="resize-none text-sm"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Industry
        </label>
        <IndustryPicker
          values={profile.industries}
          onToggle={(v) => toggle("industries", v)}
          onAdd={(v) => add("industries", v)}
        />
      </div>


      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Location
        </label>
        <ChipGroup
          options={Array.from(new Set([...ICP_LOCATION_OPTIONS, ...profile.locations]))}
          values={profile.locations}
          onToggle={(v) => toggle("locations", v)}
          allowAdd
          onAdd={(v) => add("locations", v)}
        />
      </div>


      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Buyer personas
        </label>
        <ChipGroup
          options={Array.from(new Set([...ICP_PERSONA_OPTIONS, ...profile.personas]))}
          values={profile.personas}
          onToggle={(v) => toggle("personas", v)}
          allowAdd
          onAdd={(v) => add("personas", v)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Company size
        </label>
        <ChipGroup
          options={ICP_COMPANY_SIZE_OPTIONS}
          values={profile.companySizes}
          onToggle={(v) => toggle("companySizes", v)}
        />
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-xs text-muted-foreground">
          {profile.industries.length} industries · {profile.personas.length} personas
        </span>
        <Button size="sm" onClick={onConfirm} disabled={!canContinue}>
          Confirm ICP <ArrowRight className="ml-1 size-3.5" />
        </Button>
      </div>
    </Card>
  );
}

/* -------------------- Workspace creation -------------------- */

function WorkspaceSetupCard({
  name,
  onNameChange,
  logo,
  onLogoChange,
  onConfirm,
}: {
  name: string;
  onNameChange: (v: string) => void;
  logo?: string;
  onLogoChange: (v?: string) => void;
  onConfirm: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (f: File | undefined | null) => {
    if (!f || !/^image\//.test(f.type)) return;
    const reader = new FileReader();
    reader.onload = () => onLogoChange(String(reader.result));
    reader.readAsDataURL(f);
  };

  
  const canContinue = name.trim().length >= 2;

  return (
    <Card className="space-y-5 p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Create your workspace</h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            accept(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
          )}
        >
          {logo ? (
            <img src={logo} alt="Workspace logo preview" className="size-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">
              {(name.trim()[0] ?? "W").toUpperCase()}
            </span>
          )}
          <div className="absolute bottom-1 right-1 flex size-7 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <Pencil className="size-3.5 text-muted-foreground" />
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => accept(e.target.files?.[0])}
          />
        </div>

        <div className="w-full max-w-sm space-y-2">
          <Input
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canContinue) onConfirm();
            }}
            placeholder="Workspace name"
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button size="sm" onClick={onConfirm} disabled={!canContinue}>
          Create workspace <ArrowRight className="ml-1 size-3.5" />
        </Button>
      </div>
    </Card>
  );
}

/* -------------------- Page -------------------- */

/** Pre-fills the workspace name with the user's name (from profile or LinkedIn handle). */
function defaultWorkspaceName(linkedinUrl?: string): string {
  const stored = loadUser().displayName;
  if (stored && stored !== "there") return stored;
  const handle = linkedinUrl?.replace(/\/+$/, "").split("/").pop() ?? "";
  const pretty = handle
    .replace(/-[a-z0-9]{6,}$/i, "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return pretty || "My workspace";
}



function OnboardingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<OnboardingData>(() => loadOnboarding());
  const [linkedin, setLinkedin] = useState(data.linkedinUrl ?? "");
  const [website, setWebsite] = useState(data.websiteUrl ?? "");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisDone, setAnalysisDone] = useState(false);
  const emptyProfile: IcpProfile = {
    companyDescription: "",
    industries: [],
    locations: [],
    personas: [],
    companySizes: [],
  };
  const [icpProfile, setIcpProfile] = useState<IcpProfile>(
    data.icpProfile ?? emptyProfile,
  );
  const [icpAiGenerated, setIcpAiGenerated] = useState(!!data.websiteUrl);
  const [workspaceName, setWorkspaceName] = useState(
    data.workspace?.name ?? defaultWorkspaceName(data.linkedinUrl),
  );
  const [workspaceLogo, setWorkspaceLogo] = useState<string | undefined>(
    data.workspace?.logo,
  );
  const [typing, setTyping] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [processingIdx, setProcessingIdx] = useState(0);
  const [processingDone, setProcessingDone] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bootstrapped = useRef(false);

  useEffect(() => saveOnboarding(data), [data]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [data.messages, typing, processingIdx, analysisStep]);

  const pushAssistant = (content: string, variant: ChatMessage["variant"] = "text") =>
    new Promise<void>((resolve) => {
      setTyping(true);
      const delay = 550;
      setTimeout(() => {
        setTyping(false);
        const id = uid();
        setStreamingId(id);
        setData((d) => ({
          ...d,
          messages: [...d.messages, { id, role: "assistant", content, variant }],
        }));
        const streamMs = Math.min(1400, content.length * 14 + 200);
        setTimeout(() => {
          setStreamingId(null);
          resolve();
        }, streamMs);
      }, delay);
    });

  const pushUser = (content: string) => {
    setData((d) => ({
      ...d,
      messages: [...d.messages, { id: uid(), role: "user", content }],
    }));
  };

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      if (data.state === "finished") {
        navigate({ to: "/home" });
        return;
      }
      if (data.messages.length === 0) {
        await pushAssistant("Welcome! Let's get your workspace ready.");
        await pushAssistant("First, paste your LinkedIn profile URL.", "linkedin-input");
      }
      if (data.state === "analyzing_website") {
        void runWebsiteAnalysis(data.websiteUrl);
      }
      if (data.state === "processing") {
        void runProcessing();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const linkedinValid = LINKEDIN_URL_REGEX.test(linkedin.trim());
  const websiteValid = WEBSITE_URL_REGEX.test(website.trim());

  async function submitLinkedin() {
    if (!linkedinValid) return;
    const url = linkedin.trim();
    pushUser(url);
    setData((d) => ({ ...d, linkedinUrl: url, state: "scraping" }));
    await pushAssistant("Perfect. I'm analyzing your profile now.");
    await new Promise((r) => setTimeout(r, 900));
    setData((d) => ({ ...d, state: "waiting_website" }));
    await pushAssistant(
      "Now share your company website — I'll use it to pre-configure your ICP.",
      "website-input",
    );
  }

  async function submitWebsite() {
    if (!websiteValid) return;
    const url = website.trim();
    pushUser(url);
    setData((d) => ({ ...d, websiteUrl: url, state: "analyzing_website" }));
    await pushAssistant("Reading your website and reasoning about your ICP.", "website-analysis");
    void runWebsiteAnalysis(url);
  }

  async function skipWebsite() {
    pushUser("Continue without importing my site");
    setData((d) => ({
      ...d,
      websiteSkipped: true,
      state: "collecting_icp",
    }));
    setIcpProfile({ ...emptyProfile, companyDescription: undefined });
    setIcpAiGenerated(false);
    await pushAssistant(
      "No worries. Let's build your ICP from scratch — start by picking a few options below.",
      "icp-picker",
    );
  }

  async function runWebsiteAnalysis(url?: string) {
    setAnalysisStep(0);
    setAnalysisDone(false);
    for (let i = 0; i < WEBSITE_ANALYSIS_STEPS.length; i++) {
      setAnalysisStep(i);
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    }
    setAnalysisStep(WEBSITE_ANALYSIS_STEPS.length);
    setAnalysisDone(true);

    const suggested = suggestPreIcp(url);
    setIcpProfile({
      companyDescription: suggested.companyDescription,
      industries: suggested.industries,
      locations: suggested.locations,
      personas: suggested.personas,
      companySizes: suggested.companySizes,
    });
    setIcpAiGenerated(true);

    await new Promise((r) => setTimeout(r, 300));
    setData((d) => ({ ...d, state: "collecting_icp" }));
    await pushAssistant(
      "Here's the pre-ICP I built from your site. Adjust anything that doesn't match.",
      "icp-picker",
    );
  }

  async function confirmIcp() {
    const summaryParts = [
      icpProfile.industries.length ? `${icpProfile.industries.length} industries` : "",
      icpProfile.personas.length ? `${icpProfile.personas.slice(0, 3).join(", ")}${icpProfile.personas.length > 3 ? "…" : ""}` : "",
    ].filter(Boolean);
    pushUser(`ICP confirmed — ${summaryParts.join(" · ")}`);
    setData((d) => ({
      ...d,
      icp: icpProfile.personas,
      icpProfile,
      state: "creating_workspace",
    }));
    await pushAssistant(
      "Last step: let's create your workspace — the shared space where you and your team will work.",
      "workspace-setup",
    );
  }

  async function confirmWorkspace() {
    const name = workspaceName.trim();
    if (name.length < 2) return;
    pushUser(`Workspace: ${name}`);
    setData((d) => ({
      ...d,
      workspace: { name, logo: workspaceLogo, createdAt: Date.now() },
      state: "processing",
    }));
    
    await pushAssistant(`Creating "${name}" and setting everything up.`, "processing");
    void runProcessing();
  }


  async function runProcessing() {
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setProcessingIdx(i);
      await new Promise((r) => setTimeout(r, 750 + Math.random() * 500));
      setProcessingDone((prev) => [...prev, i]);
    }
    await new Promise((r) => setTimeout(r, 400));

    const tasks = makeInitialTasks();
    setData((d) => ({ ...d, tasks, state: "finished", completedAt: Date.now() }));
    saveUser({ ...loadUser(), onboardingCompleted: true });

    await pushAssistant("🎉 Your workspace is ready.", "done");
  }

  const showLinkedinInput =
    data.state === "waiting_linkedin" &&
    data.messages.some((m) => m.variant === "linkedin-input");
  const showWebsiteInput = data.state === "waiting_website";
  const showWebsiteAnalysis = data.state === "analyzing_website";
  const showIcpPicker = data.state === "collecting_icp";
  const showWorkspaceSetup = data.state === "creating_workspace";
  const showConnectionsUpload = data.state === "importing_connections";
  const showProcessing = data.state === "processing";

  const progressValue = useMemo(
    () => Math.round(((processingIdx + 1) / PROCESSING_STEPS.length) * 100),
    [processingIdx],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <IslaWordmark className="h-6 w-auto text-white" />
          <Badge variant="secondary" className="capitalize">
            {data.state.replace(/_/g, " ")}
          </Badge>
        </div>
      </header>

      <div className="flex-1">
        <ScrollArea className="mx-auto h-[calc(100vh-64px)] max-w-3xl px-6">
          <div ref={scrollRef} className="space-y-4 py-8">
            {data.messages.map((m) =>
              m.role === "assistant" ? (
                <AssistantBubble
                  key={m.id}
                  message={m}
                  streaming={m.id === streamingId}
                />
              ) : (
                <UserBubble key={m.id} message={m} />
              ),
            )}
            {typing && <TypingIndicator />}

            {showLinkedinInput && !typing && !streamingId && (
              <div className="ml-11 max-w-xl">
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Linkedin className="size-4 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && linkedinValid) submitLinkedin();
                      }}
                      placeholder="https://linkedin.com/in/your-handle"
                      className="border-0 shadow-none focus-visible:ring-0"
                    />
                    <Button size="sm" onClick={submitLinkedin} disabled={!linkedinValid}>
                      Continue <ArrowRight className="ml-1 size-3.5" />
                    </Button>
                  </div>
                  {linkedin && !linkedinValid && (
                    <p className="mt-2 px-1 text-xs text-destructive">
                      Enter a valid LinkedIn profile URL.
                    </p>
                  )}
                </Card>
              </div>
            )}

            {showWebsiteInput && !typing && !streamingId && (
              <div className="ml-11 max-w-xl space-y-2">
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <Input
                      autoFocus
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && websiteValid) submitWebsite();
                      }}
                      placeholder="https://yourcompany.com"
                      className="border-0 shadow-none focus-visible:ring-0"
                    />
                    <Button size="sm" onClick={submitWebsite} disabled={!websiteValid}>
                      Analyze <ArrowRight className="ml-1 size-3.5" />
                    </Button>
                  </div>
                  {website && !websiteValid && (
                    <p className="mt-2 px-1 text-xs text-destructive">
                      Enter a valid website URL.
                    </p>
                  )}
                </Card>
                <button
                  type="button"
                  onClick={skipWebsite}
                  className="ml-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Continue without importing my site
                </button>
              </div>
            )}

            {showWebsiteAnalysis && (
              <div className="ml-11 max-w-xl">
                <WebsiteAnalysisCard
                  websiteUrl={data.websiteUrl}
                  currentStep={analysisStep}
                  done={analysisDone}
                />
              </div>
            )}

            {showIcpPicker && !typing && !streamingId && (
              <div className="ml-11 max-w-2xl">
                <PreIcpBuilder
                  profile={icpProfile}
                  onChange={setIcpProfile}
                  onConfirm={confirmIcp}
                  aiGenerated={icpAiGenerated}
                />
              </div>
            )}

            {showWorkspaceSetup && !typing && !streamingId && (
              <div className="ml-11 max-w-2xl">
                <WorkspaceSetupCard
                  name={workspaceName}
                  onNameChange={setWorkspaceName}
                  logo={workspaceLogo}
                  onLogoChange={setWorkspaceLogo}
                  onConfirm={confirmWorkspace}
                />
              </div>
            )}



            {showConnectionsUpload && !typing && !streamingId && (
              <div className="ml-11 max-w-xl">
                <ConnectionsUpload onFile={() => {}} />
              </div>
            )}

            {showProcessing && (
              <div className="ml-11 max-w-xl">
                <Card className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium">Building your workspace</div>
                    <span className="text-xs text-muted-foreground">{progressValue}%</span>
                  </div>
                  <Progress value={progressValue} className="mb-4" />
                  <ul className="space-y-2">
                    {PROCESSING_STEPS.map((s, i) => {
                      const done = processingDone.includes(i);
                      const active = i === processingIdx && !done;
                      const idle = i > processingIdx;
                      return (
                        <li
                          key={s}
                          className={cn(
                            "flex items-center gap-2 text-xs transition-opacity",
                            idle && "opacity-40",
                          )}
                        >
                          {done ? (
                            <CheckCircle2 className="size-3.5 text-primary" />
                          ) : active ? (
                            <Loader2 className="size-3.5 animate-spin text-primary" />
                          ) : (
                            <div className="size-3.5 rounded-full border border-border" />
                          )}
                          <span className={cn(done && "text-muted-foreground line-through")}>
                            {s}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </div>
            )}

            {data.state === "finished" && !typing && !streamingId && (
              <div className="ml-11">
                <Button onClick={() => navigate({ to: "/home" })}>
                  Enter workspace <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
