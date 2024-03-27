"use client"
import Image from "next/image";

export default function Home() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const file = event.target.file.files[0];

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/procesarExcel", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" accept=".xlsx" required />
      <button type="submit">Subir y procesar</button>
    </form>
  );
}
