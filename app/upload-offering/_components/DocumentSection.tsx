import React from "react";
import { UploadCloud, Loader2, FileText } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { OfferingFormData } from "./types";

interface Props {
  file: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isParsing: boolean;
  extractedText: string;
  setExtractedText: (text: string) => void;
  formData: OfferingFormData;
  handleSelectChange: (name: string, value: string) => void;
}

export function DocumentSection({
  file,
  handleFileChange,
  isParsing,
  extractedText,
  setExtractedText,
  formData,
  handleSelectChange,
}: Props) {
  return (
    <section className="pt-4">
      <h3 className="text-2xl font-semibold text-white mb-8 border-b border-white/10 pb-4">
        Offering Document / भेंट दस्तावेज़
      </h3>

      <div className="space-y-6">
        <label
          className={`flex flex-col items-center justify-center w-full min-h-[240px] border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 group
            ${
              file
                ? "border-white/30 bg-white/10"
                : "border-white/20 bg-white/5 hover:bg-white/10"
            }`}
        >
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <UploadCloud
              className={`w-16 h-16 mb-6 transition-colors ${
                file ? "text-white" : "text-gray-400 group-hover:text-white"
              }`}
            />
            <p className="mb-2 text-xl text-white">
              <span className="font-semibold">
                {file ? "Replace document" : "Click to upload"}
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-sm text-gray-400 max-w-sm">
              Only Microsoft Word (.docx) files are supported up to 10MB.
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".docx"
            onChange={handleFileChange}
          />
        </label>

        {isParsing && (
          <div className="flex items-center justify-center p-6 text-gray-300 gap-3 border border-white/10 rounded-2xl bg-white/5 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" /> Extracting text from
            document...
          </div>
        )}

        {file && !isParsing && extractedText && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 pt-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-5 bg-white/10 border border-white/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl shadow-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold truncate max-w-[200px] sm:max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select
                  value={formData.language}
                  onValueChange={(val) =>
                    handleSelectChange("language", val as string)
                  }
                >
                  <SelectTrigger className="h-10 px-4 bg-white/10 border-white/20 text-white focus:ring-white/20 rounded-lg shrink-0 w-[140px] font-medium">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-base font-medium text-white flex flex-col gap-0.5">
                  <span>Document Preview</span>
                  <span className="text-sm text-gray-400 font-normal">
                    दस्तावेज़ पूर्वावलोकन
                  </span>
                </label>
                <span className="text-sm text-gray-400">
                  You may edit this text before submitting
                </span>
              </div>
              <div className="w-full h-[400px] bg-white border border-gray-200 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-[#0a2540]/20 focus-within:border-[#0a2540]/30 transition-shadow shadow-sm">
                <textarea
                  className="w-full h-full p-6 bg-transparent text-gray-800 border-none outline-none resize-none rounded-xl leading-relaxed text-xl"
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Your offering text will appear here..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
