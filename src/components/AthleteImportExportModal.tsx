import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
  RefreshCw,
  UserCheck,
  Users,
  Calendar,
  Phone,
  FileText,
  AlertTriangle,
  Info
} from "lucide-react";
import { Usuario } from "@/types";
import { useStore } from "@/store";
import { NeuButton } from "@/components/ui/NeuButton";
import { NeuCard } from "@/components/ui/NeuCard";

interface AthleteImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedAthletes: Usuario[];
  trainerId?: string;
}

interface ParsedAthleteRow {
  dni: string;
  nombres: string;
  fecha_inicial: string;
  whatsapp: string;
  sexo: "masculino" | "femenino" | "otro";
  fecha_final: string;
  isExisting: boolean;
  isValid: boolean;
  errors: string[];
}

export function AthleteImportExportModal({
  isOpen,
  onClose,
  assignedAthletes,
  trainerId,
}: AthleteImportExportModalProps) {
  const { usuarios, addUsuario, updateUsuario } = useStore();
  const [activeTab, setActiveTab] = useState<"exportar" | "importar">("exportar");
  const [copied, setCopied] = useState(false);

  // Import states
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedAthleteRow[]>([]);
  const [importStatus, setImportStatus] = useState<"idle" | "parsed" | "importing" | "success">("idle");
  const [importSuccessCount, setImportSuccessCount] = useState(0);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // Format date helper to convert Excel date numbers / strings / objects to YYYY-MM-DD
  const normalizeDateToISO = (raw: any): string => {
    if (!raw) return todayStr;

    // If Date object
    if (raw instanceof Date) {
      if (isNaN(raw.getTime())) return todayStr;
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, "0");
      const d = String(raw.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    // If Excel serial number (e.g. 45678)
    if (typeof raw === "number") {
      const parsedDate = new Date(Math.round((raw - 25569) * 86400 * 1000));
      if (!isNaN(parsedDate.getTime())) {
        const y = parsedDate.getUTCFullYear();
        const m = String(parsedDate.getUTCMonth() + 1).padStart(2, "0");
        const d = String(parsedDate.getUTCDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    }

    const clean = String(raw).trim();
    if (!clean) return todayStr;

    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

    // If DD/MM/YYYY or DD-MM-YYYY
    const dmy = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmy) {
      const day = dmy[1].padStart(2, "0");
      const month = dmy[2].padStart(2, "0");
      const year = dmy[3];
      return `${year}-${month}-${day}`;
    }

    // If YYYY/MM/DD
    const ymd = clean.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
    if (ymd) {
      const year = ymd[1];
      const month = ymd[2].padStart(2, "0");
      const day = ymd[3].padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return clean;
  };

  // Prepare export data rows
  const exportData = useMemo(() => {
    return assignedAthletes.map((ath) => {
      const fechaInicial = ath.suscripcion?.fecha_inicio || ath.fecha_nacimiento || todayStr;
      const fechaFinal = ath.suscripcion?.fecha_fin || todayStr;
      const whatsapp = ath.whatsapp || "";
      const sexo = ath.sexo || "masculino";

      return {
        dni: ath.dni || "",
        nombres: ath.nombre || "",
        fecha_inicial: fechaInicial,
        whatsapp: whatsapp,
        sexo: sexo,
        fecha_final: fechaFinal,
      };
    });
  }, [assignedAthletes, todayStr]);

  // Download XLSX Excel File
  const handleDownloadXLSX = () => {
    try {
      const headers = ["DNI", "Nombres", "Fecha de Inicial", "Whatsapp", "Sexo", "Fecha Final"];
      const rows = exportData.map((row) => [
        row.dni,
        row.nombres,
        row.fecha_inicial,
        row.whatsapp,
        row.sexo,
        row.fecha_final,
      ]);

      const worksheetData = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Define standard column widths for clean Excel presentation
      worksheet["!cols"] = [
        { wch: 14 }, // DNI
        { wch: 30 }, // Nombres
        { wch: 18 }, // Fecha de Inicial
        { wch: 18 }, // Whatsapp
        { wch: 14 }, // Sexo
        { wch: 18 }, // Fecha Final
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Atletas Asignados");

      XLSX.writeFile(workbook, `atletas_asignados_${todayStr}.xlsx`);
    } catch (err) {
      console.error("Error generating XLSX file:", err);
    }
  };

  // Copy to clipboard formatted
  const handleCopyClipboard = async () => {
    const headers = ["DNI", "Nombres", "Fecha de Inicial", "Whatsapp", "Sexo", "Fecha Final"];
    const rows = exportData.map((row) => [
      row.dni,
      row.nombres,
      row.fecha_inicial,
      row.whatsapp,
      row.sexo,
      row.fecha_final,
    ]);
    const textContent = [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Clipboard write failed:", e);
    }
  };

  // Download Sample Template XLSX
  const handleDownloadSampleTemplate = () => {
    try {
      const sampleHeaders = ["DNI", "Nombres", "Fecha de Inicial", "Whatsapp", "Sexo", "Fecha Final"];
      const sampleRows = [
        ["10101010", "Xiomara Ballón", "2026-01-01", "+51987654321", "femenino", "2026-03-31"],
        ["20202020", "Carlos Mendoza", "2026-02-15", "+51912345678", "masculino", "2026-05-15"],
        ["30303030", "Ana Silva", "2026-03-01", "+51998877665", "femenino", "2026-06-01"],
      ];

      const worksheetData = [sampleHeaders, ...sampleRows];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      worksheet["!cols"] = [
        { wch: 14 },
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        { wch: 14 },
        { wch: 18 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Atletas");

      XLSX.writeFile(workbook, "plantilla_importacion_atletas.xlsx");
    } catch (err) {
      console.error("Error creating sample template:", err);
    }
  };

  // Parse raw matrix rows into structured athlete objects
  const processMatrixRows = (matrix: any[][]) => {
    setImportErrorMsg(null);
    if (!matrix || matrix.length === 0) {
      setParsedRows([]);
      setImportStatus("idle");
      return;
    }

    // Filter out completely empty lines
    const cleanRows = matrix.filter((r) => r && r.some((c) => c !== undefined && c !== null && String(c).trim() !== ""));
    if (cleanRows.length === 0) {
      setParsedRows([]);
      setImportStatus("idle");
      return;
    }

    // Identify header row
    const firstRowCols = cleanRows[0].map((c) => String(c || "").toLowerCase().trim());
    const hasHeader =
      firstRowCols.some((c) => c.includes("dni")) ||
      firstRowCols.some((c) => c.includes("nom")) ||
      firstRowCols.some((c) => c.includes("inic")) ||
      firstRowCols.some((c) => c.includes("what"));

    // Find column positions dynamically if headers exist
    let dniIdx = 0;
    let nomIdx = 1;
    let fechaIniIdx = 2;
    let whatIdx = 3;
    let sexoIdx = 4;
    let fechaFinIdx = 5;

    if (hasHeader) {
      firstRowCols.forEach((col, idx) => {
        if (col.includes("dni")) dniIdx = idx;
        else if (col.includes("nom")) nomIdx = idx;
        else if (col.includes("inic") || col.includes("comienzo") || col.includes("inicio")) fechaIniIdx = idx;
        else if (col.includes("what") || col.includes("cel") || col.includes("tel") || col.includes("movil")) whatIdx = idx;
        else if (col.includes("sex") || col.includes("gen")) sexoIdx = idx;
        else if (col.includes("fin") || col.includes("venc") || col.includes("termino")) fechaFinIdx = idx;
      });
    }

    const dataRows = hasHeader ? cleanRows.slice(1) : cleanRows;

    const parsed: ParsedAthleteRow[] = [];

    dataRows.forEach((row) => {
      const dni = String(row[dniIdx] !== undefined && row[dniIdx] !== null ? row[dniIdx] : "").trim();
      const nombres = String(row[nomIdx] !== undefined && row[nomIdx] !== null ? row[nomIdx] : "").trim();
      const rawFechaIni = row[fechaIniIdx];
      const whatsapp = String(row[whatIdx] !== undefined && row[whatIdx] !== null ? row[whatIdx] : "").trim();
      const rawSexo = String(row[sexoIdx] !== undefined && row[sexoIdx] !== null ? row[sexoIdx] : "").trim().toLowerCase();
      const rawFechaFin = row[fechaFinIdx];

      if (!dni && !nombres) return;

      const errors: string[] = [];
      if (!dni) errors.push("Falta DNI");
      if (!nombres) errors.push("Falta Nombre");

      // Normalize gender
      let sexo: "masculino" | "femenino" | "otro" = "masculino";
      if (rawSexo.startsWith("f") || rawSexo === "mujer") {
        sexo = "femenino";
      } else if (rawSexo.startsWith("m") || rawSexo === "hombre") {
        sexo = "masculino";
      } else if (rawSexo.startsWith("o")) {
        sexo = "otro";
      }

      const fecha_inicial = normalizeDateToISO(rawFechaIni);
      const fecha_final = normalizeDateToISO(rawFechaFin);

      const existingUser = usuarios.find((u) => u.dni.trim().toLowerCase() === dni.toLowerCase());

      parsed.push({
        dni,
        nombres,
        fecha_inicial,
        whatsapp,
        sexo,
        fecha_final,
        isExisting: !!existingUser,
        isValid: errors.length === 0,
        errors,
      });
    });

    if (parsed.length === 0) {
      setImportErrorMsg("No se encontraron registros de atletas en el archivo.");
      setImportStatus("idle");
      return;
    }

    setParsedRows(parsed);
    setImportStatus("parsed");
  };

  // Handle XLSX / XLS File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();

    const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.type.includes("spreadsheet") || file.type.includes("excel");

    if (isXlsx) {
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawMatrix = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            dateNF: "yyyy-mm-dd",
            defval: ""
          }) as any[][];

          processMatrixRows(rawMatrix);
        } catch (err) {
          console.error("Error reading XLSX:", err);
          setImportErrorMsg("No se pudo leer el archivo Excel (.xlsx). Verifica que el formato sea válido.");
          setImportStatus("idle");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV or plain text fallback
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const workbook = XLSX.read(text, { type: "string" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawMatrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
          processMatrixRows(rawMatrix);
        } catch (err) {
          console.error("Error reading file text:", err);
          setImportErrorMsg("No se pudo leer el archivo. Sube un archivo .xlsx válido.");
          setImportStatus("idle");
        }
      };
      reader.readAsText(file, "UTF-8");
    }
  };

  // Perform import
  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setImportErrorMsg("No hay filas válidas para importar.");
      return;
    }

    setImportStatus("importing");
    let count = 0;

    try {
      for (const row of validRows) {
        const existing = usuarios.find((u) => u.dni.trim().toLowerCase() === row.dni.toLowerCase());

        if (existing) {
          // Update existing user with new dates and assigned trainer
          const updated: Usuario = {
            ...existing,
            nombre: row.nombres || existing.nombre,
            whatsapp: row.whatsapp || existing.whatsapp,
            sexo: row.sexo || existing.sexo,
            id_entrenador: trainerId || existing.id_entrenador,
            suscripcion: {
              ...existing.suscripcion,
              nombre_plan: existing.suscripcion?.nombre_plan || "Plan Atleta",
              precio_pen: existing.suscripcion?.precio_pen ?? 0,
              fecha_inicio: row.fecha_inicial,
              fecha_fin: row.fecha_final,
              historial_pagos: existing.suscripcion?.historial_pagos || [],
              ultima_actualizacion: new Date().toISOString(),
            },
          };
          await updateUsuario(updated);
        } else {
          // Create new athlete
          const newId = `ath_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
          const newUser: Usuario = {
            id: newId,
            dni: row.dni,
            nombre: row.nombres,
            whatsapp: row.whatsapp,
            fecha_nacimiento: row.fecha_inicial,
            sexo: row.sexo,
            contrasena: "0000",
            estado_suscripcion: "activo",
            rol: "cliente",
            id_entrenador: trainerId,
            suscripcion: {
              nombre_plan: "Plan Atleta",
              precio_pen: 0,
              fecha_inicio: row.fecha_inicial,
              fecha_fin: row.fecha_final,
              historial_pagos: [],
              ultima_actualizacion: new Date().toISOString(),
            },
          };
          await addUsuario(newUser);
        }
        count++;
      }

      setImportSuccessCount(count);
      setImportStatus("success");
    } catch (err: any) {
      console.error("Error executing import:", err);
      setImportErrorMsg("Hubo un error al guardar los atletas en la nube.");
      setImportStatus("parsed");
    }
  };

  const handleResetImport = () => {
    setUploadedFileName(null);
    setParsedRows([]);
    setImportStatus("idle");
    setImportErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-[var(--color-bg-base)] rounded-3xl shadow-neu-flat border border-[var(--color-text-muted)]/15 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--color-text-muted)]/15 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)] flex items-center justify-center shadow-neu-pressed">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-main)]">
                  Importar / Exportar Atletas (.xlsx)
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Base de datos de atletas asignados en formato Excel ({assignedAthletes.length} registrados)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full shadow-neu-flat flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-5 pt-3 pb-1 shrink-0">
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/10">
              <button
                type="button"
                onClick={() => setActiveTab("exportar")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "exportar"
                    ? "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/20"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("importar")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "importar"
                    ? "bg-[var(--color-bg-base)] shadow-neu-flat text-[var(--color-accent-blue)] ring-1 ring-[var(--color-accent-blue)]/20"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {activeTab === "exportar" ? (
              <div className="space-y-4">
                {/* Column Structure Badge */}
                <div className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/15">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[var(--color-text-main)]">
                    <Info className="w-4 h-4 text-[var(--color-accent-blue)]" />
                    <span>Campos incluidos en el archivo .xlsx:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["DNI", "Nombres", "Fecha de Inicial", "Whatsapp", "Sexo", "Fecha Final"].map((campo) => (
                      <span
                        key={campo}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/20"
                      >
                        {campo}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Data Preview Table */}
                <div className="rounded-2xl border border-[var(--color-text-muted)]/15 overflow-hidden shadow-neu-pressed bg-[var(--color-bg-base)]">
                  <div className="p-3 border-b border-[var(--color-text-muted)]/15 flex justify-between items-center bg-[var(--color-bg-base)]">
                    <span className="text-xs font-bold text-[var(--color-text-main)] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[var(--color-accent-blue)]" />
                      Vista previa ({exportData.length} registros)
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      Formato nativo Microsoft Excel (.xlsx)
                    </span>
                  </div>

                  <div className="max-h-60 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--color-bg-base)] border-b border-[var(--color-text-muted)]/15 sticky top-0 font-bold text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5">DNI</th>
                          <th className="p-2.5">Nombres</th>
                          <th className="p-2.5">Fecha Inicial</th>
                          <th className="p-2.5">Whatsapp</th>
                          <th className="p-2.5">Sexo</th>
                          <th className="p-2.5">Fecha Final</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-text-muted)]/10">
                        {exportData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-4 text-center text-xs text-[var(--color-text-muted)] italic">
                              No hay atletas asignados para exportar.
                            </td>
                          </tr>
                        ) : (
                          exportData.map((r, i) => (
                            <tr key={i} className="hover:bg-[var(--color-text-muted)]/5 transition-colors">
                              <td className="p-2.5 font-mono font-bold text-[var(--color-text-main)]">{r.dni}</td>
                              <td className="p-2.5 font-medium text-[var(--color-text-main)]">{r.nombres}</td>
                              <td className="p-2.5 font-mono text-[var(--color-text-muted)]">{r.fecha_inicial}</td>
                              <td className="p-2.5 text-[var(--color-text-muted)]">{r.whatsapp || "-"}</td>
                              <td className="p-2.5 capitalize text-[var(--color-text-muted)]">{r.sexo}</td>
                              <td className="p-2.5 font-mono font-bold text-[var(--color-accent-blue)]">{r.fecha_final}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadXLSX}
                    disabled={exportData.length === 0}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[var(--color-accent-blue)] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar archivo Excel (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyClipboard}
                    disabled={exportData.length === 0}
                    className="py-3 px-4 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat hover:shadow-neu-pressed text-[var(--color-text-main)] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 border border-[var(--color-text-muted)]/15"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? "¡Copiado al portapapeles!" : "Copiar Datos"}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* IMPORT TAB */
              <div className="space-y-4">
                {/* Template download & instructions */}
                <div className="p-3.5 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-pressed border border-[var(--color-text-muted)]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[var(--color-text-main)] block">
                      Estructura requerida de columnas (.xlsx):
                    </span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      DNI, Nombres, Fecha de Inicial, Whatsapp, Sexo, Fecha Final
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadSampleTemplate}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat text-xs font-bold text-[var(--color-accent-blue)] hover:opacity-90 flex items-center gap-1.5 shrink-0 border border-[var(--color-text-muted)]/10 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Plantilla Excel (.xlsx)</span>
                  </button>
                </div>

                {importStatus === "success" ? (
                  /* Success Screen */
                  <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                      ¡Importación completada con éxito!
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Se han importado y sincronizado en la nube <strong>{importSuccessCount} atletas</strong> con sus respectivas fechas de inicio y fin de membresía.
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetImport}
                        className="px-4 py-2 rounded-xl bg-[var(--color-bg-base)] shadow-neu-flat text-xs font-bold text-[var(--color-text-main)]"
                      >
                        Importar otro archivo
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:opacity-90"
                      >
                        Cerrar y Ver Atletas
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* File Upload Box */}
                    <div className="p-6 rounded-2xl bg-[var(--color-bg-base)] shadow-neu-flat border border-dashed border-[var(--color-text-muted)]/30 text-center space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="xlsx-file-upload-input"
                      />
                      <label
                        htmlFor="xlsx-file-upload-input"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-blue)]/15 text-[var(--color-accent-blue)] flex items-center justify-center shadow-neu-pressed">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-[var(--color-text-main)]">
                          {uploadedFileName ? (
                            <span className="text-[var(--color-accent-blue)] flex items-center gap-1.5 justify-center">
                              <FileCheck className="w-4 h-4 text-emerald-500" />
                              {uploadedFileName}
                            </span>
                          ) : (
                            "Seleccionar o arrastrar archivo Excel (.xlsx)"
                          )}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">
                          Formatos admitidos: .xlsx, .xls (Microsoft Excel)
                        </span>
                      </label>

                      {uploadedFileName && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleResetImport}
                            className="text-[11px] font-bold text-rose-500 hover:underline"
                          >
                            Cambiar de archivo
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Import Error Message */}
                    {importErrorMsg && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{importErrorMsg}</span>
                      </div>
                    )}

                    {/* Parsed Preview */}
                    {parsedRows.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[var(--color-text-main)]">
                            Filas detectadas ({parsedRows.length}):
                          </span>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓ {parsedRows.filter((r) => r.isValid).length} válidas
                            </span>
                            {parsedRows.some((r) => !r.isValid) && (
                              <span className="text-rose-500 font-bold">
                                ⚠ {parsedRows.filter((r) => !r.isValid).length} con errores
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--color-text-muted)]/15 overflow-hidden shadow-neu-pressed bg-[var(--color-bg-base)] max-h-52 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--color-bg-base)] border-b border-[var(--color-text-muted)]/15 sticky top-0 font-bold text-[var(--color-text-muted)] text-[10px] uppercase">
                              <tr>
                                <th className="p-2">DNI</th>
                                <th className="p-2">Nombres</th>
                                <th className="p-2">Fecha Inicial</th>
                                <th className="p-2">Whatsapp</th>
                                <th className="p-2">Sexo</th>
                                <th className="p-2">Fecha Final</th>
                                <th className="p-2">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-text-muted)]/10">
                              {parsedRows.map((r, i) => (
                                <tr key={i} className={!r.isValid ? "bg-rose-500/5" : ""}>
                                  <td className="p-2 font-mono font-bold">{r.dni || "-"}</td>
                                  <td className="p-2 font-medium">{r.nombres || "-"}</td>
                                  <td className="p-2 font-mono text-[var(--color-text-muted)]">{r.fecha_inicial}</td>
                                  <td className="p-2 text-[var(--color-text-muted)]">{r.whatsapp || "-"}</td>
                                  <td className="p-2 capitalize text-[var(--color-text-muted)]">{r.sexo}</td>
                                  <td className="p-2 font-mono text-[var(--color-accent-blue)] font-bold">{r.fecha_final}</td>
                                  <td className="p-2">
                                    {r.isValid ? (
                                      r.isExisting ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                          Actualizar
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                                          Nuevo
                                        </span>
                                      )
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600">
                                        {r.errors.join(", ")}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Execute Button */}
                        <button
                          type="button"
                          onClick={handleExecuteImport}
                          disabled={importStatus === "importing" || parsedRows.filter((r) => r.isValid).length === 0}
                          className="w-full py-3 px-4 rounded-2xl bg-[var(--color-accent-blue)] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                          {importStatus === "importing" ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Importando y sincronizando con la nube...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>
                                Importar {parsedRows.filter((r) => r.isValid).length} Atletas a la Nube
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
