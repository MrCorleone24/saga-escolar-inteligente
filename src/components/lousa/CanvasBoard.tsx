import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Type, Square, Circle, Minus, Eraser, Undo2, Redo2, Smile, Sticker, Download, Trash2, FileJson } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

type Tool = "pen" | "text" | "rect" | "circle" | "line" | "eraser";

const COLORS = [
  "#1a1a2e", "#2563eb", "#16a34a", "#dc2626", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#ffffff",
];

const EMOJIS = {
  "Rostos": ["😊", "😂", "🤔", "😍", "🥳", "😎", "🤩", "😇", "🧐", "🤓"],
  "Escola": ["📚", "✏️", "📝", "🎓", "📐", "🔬", "🧮", "🎨", "🏫", "📖"],
  "Mãos": ["👍", "👏", "✌️", "🙌", "💪", "🤝", "👋", "✋", "🖐️", "🤟"],
  "Natureza": ["🌟", "🌈", "🌻", "🦋", "🌍", "🌙", "⭐", "🔥", "💧", "🌱"],
};

const STICKERS = [
  { emoji: "⭐", label: "Estrela" },
  { emoji: "❤️", label: "Coração" },
  { emoji: "🏆", label: "Troféu" },
  { emoji: "🎉", label: "Parabéns" },
  { emoji: "💯", label: "100 pontos" },
  { emoji: "🔥", label: "Em chamas" },
  { emoji: "🌟", label: "Brilhante" },
  { emoji: "🎖️", label: "Medalha" },
];

interface CanvasBoardProps {
  onExportPDF?: () => void;
}

export default function CanvasBoard({ onExportPDF }: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState("Rostos");
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [placedStickers, setPlacedStickers] = useState<{ emoji: string; x: number; y: number; id: number }[]>([]);
  const stickerIdRef = useRef(0);

  const getCtx = useCallback(() => canvasRef.current?.getContext("2d"), []);

  const saveState = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    const data = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [getCtx, history, historyIndex]);

  const undo = () => {
    if (historyIndex <= 0) return;
    const ctx = getCtx();
    if (!ctx) return;
    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const ctx = getCtx();
    if (!ctx) return;
    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPlacedStickers([]);
    saveState();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.max(500, rect.height);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([data]);
      setHistoryIndex(0);
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    if (tool === "text") {
      const text = prompt("Digite o texto:");
      if (text) {
        ctx.font = `${lineWidth * 6}px 'Plus Jakarta Sans', sans-serif`;
        ctx.fillStyle = color;
        ctx.fillText(text, pos.x, pos.y);
        saveState();
      }
      setIsDrawing(false);
      return;
    }

    if (tool === "pen" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;

    if (tool === "rect" || tool === "circle" || tool === "line") {
      const endPos = "changedTouches" in e
        ? { x: e.changedTouches[0].clientX - canvasRef.current.getBoundingClientRect().left, y: e.changedTouches[0].clientY - canvasRef.current.getBoundingClientRect().top }
        : getPos(e as React.MouseEvent);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      if (tool === "rect") {
        ctx.strokeRect(startPos.x, startPos.y, endPos.x - startPos.x, endPos.y - startPos.y);
      } else if (tool === "circle") {
        const rx = Math.abs(endPos.x - startPos.x) / 2;
        const ry = Math.abs(endPos.y - startPos.y) / 2;
        ctx.ellipse(startPos.x + (endPos.x - startPos.x) / 2, startPos.y + (endPos.y - startPos.y) / 2, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
      }
    }

    setIsDrawing(false);
    saveState();
  };

  const addEmoji = (emoji: string) => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    ctx.font = "48px serif";
    ctx.fillText(emoji, canvasRef.current.width / 2 - 24, canvasRef.current.height / 2);
    saveState();
    setShowEmojis(false);
  };

  const addSticker = (emoji: string) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setPlacedStickers(prev => [...prev, {
      emoji, x: rect.width / 2 - 30, y: rect.height / 2 - 30, id: stickerIdRef.current++
    }]);
    setShowStickers(false);
  };

  const exportPDF = async () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // Create PDF
    const pdf = new jsPDF("l", "px", [canvas.width, canvas.height]);
    
    // Use html2canvas to capture stickers too
    const canvasImg = await html2canvas(container);
    const imgData = canvasImg.toDataURL("image/png");
    
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("lousa-digital.pdf");
    onExportPDF?.();
  };

  const tools: { tool: Tool; icon: React.ElementType; label: string }[] = [
    { tool: "pen", icon: Pen, label: "Caneta" },
    { tool: "text", icon: Type, label: "Texto" },
    { tool: "rect", icon: Square, label: "Retângulo" },
    { tool: "circle", icon: Circle, label: "Círculo" },
    { tool: "line", icon: Minus, label: "Linha" },
    { tool: "eraser", icon: Eraser, label: "Borracha" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="bg-card rounded-xl border border-border p-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {tools.map(t => (
            <button
              key={t.tool}
              onClick={() => setTool(t.tool)}
              title={t.label}
              className={`p-2.5 rounded-lg transition-colors ${tool === t.tool ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
            >
              <t.icon size={18} />
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="flex gap-1.5 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "scale-125 border-primary" : "border-transparent hover:scale-110"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Espessura</span>
          <input type="range" min="1" max="20" value={lineWidth} onChange={e => setLineWidth(+e.target.value)} className="w-20 accent-primary" />
          <span className="text-xs font-medium w-5">{lineWidth}</span>
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="flex gap-1">
          <button onClick={() => setShowEmojis(!showEmojis)} className={`p-2.5 rounded-lg transition-colors ${showEmojis ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground"}`} title="Emojis">
            <Smile size={18} />
          </button>
          <button onClick={() => setShowStickers(!showStickers)} className={`p-2.5 rounded-lg transition-colors ${showStickers ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground"}`} title="Stickers">
            <Sticker size={18} />
          </button>
        </div>

        <div className="w-px h-8 bg-border" />

        <div className="flex gap-1">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30" title="Desfazer">
            <Undo2 size={18} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-30" title="Refazer">
            <Redo2 size={18} />
          </button>
          <button onClick={clearCanvas} className="p-2.5 rounded-lg hover:bg-destructive/10 text-destructive" title="Limpar">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="ml-auto">
          <Button onClick={exportPDF} variant="outline" size="sm">
            <Download size={14} className="mr-1.5" /> Exportar
          </Button>
        </div>
      </div>

      {/* Emoji panel */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-card rounded-xl border border-border p-4">
            <div className="flex gap-2 mb-3">
              {Object.keys(EMOJIS).map(cat => (
                <button key={cat} onClick={() => setEmojiCategory(cat)} className={`text-xs px-3 py-1.5 rounded-full transition-colors ${emojiCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-10 gap-2">
              {EMOJIS[emojiCategory as keyof typeof EMOJIS].map((e, i) => (
                <button key={i} onClick={() => addEmoji(e)} className="text-2xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-muted">
                  {e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticker panel */}
      <AnimatePresence>
        {showStickers && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-3">Stickers animados — clique para adicionar na lousa</p>
            <div className="flex gap-3 flex-wrap">
              {STICKERS.map((s, i) => (
                <motion.button
                  key={i}
                  onClick={() => addSticker(s.emoji)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} className="text-3xl">
                    {s.emoji}
                  </motion.span>
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div ref={containerRef} className="relative bg-card rounded-xl border-2 border-border overflow-hidden" style={{ minHeight: 500 }}>
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none"
          style={{ width: "100%", display: "block" }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        {/* Animated stickers overlay */}
        {placedStickers.map(s => (
          <motion.div
            key={s.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0, y: [0, -8, 0] }}
            transition={{ y: { repeat: Infinity, duration: 2 } }}
            className="absolute text-5xl select-none pointer-events-none"
            style={{ left: s.x, top: s.y }}
          >
            {s.emoji}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
