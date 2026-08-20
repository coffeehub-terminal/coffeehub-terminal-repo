"use client";

import { useState } from "react";

type Props = {
  logisticsId: number;
  documentType: string;
};

export default function DocumentUploader({
  logisticsId,
  documentType,
}: Props) {
  const [uploading, setUploading] = useState(false);

  async function uploadFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("logisticsId", logisticsId.toString());
    formData.append("documentType", documentType);

    try {
      const res = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      setUploading(false);

      if (!res.ok) {
        console.error(result);
        alert(JSON.stringify(result, null, 2));
        return;
      }

      alert(`${documentType} uploaded successfully.`);
      window.location.reload();

    } catch (err) {
      setUploading(false);
      console.error(err);
      alert("Upload failed.");
    }
  }

  return (
    <div className="flex items-center justify-between bg-[#10231e] rounded-xl p-4">

      <div>
        <div className="font-bold">
          {documentType}
        </div>

        <div className="text-gray-400 text-sm">
          PDF, Word, Excel or Images
        </div>
      </div>

      <label className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg cursor-pointer font-bold cursor-pointer">
        {uploading ? "Uploading..." : "Upload"}

        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          className="hidden"
          onChange={uploadFile}
        />
      </label>

    </div>
  );
}