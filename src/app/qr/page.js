"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [qrImg, setQrImg] = useState("");

  const route = useRouter();

  useEffect(() => {
    const getQr = async () => {
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_URL_SERVER + "/qr", {
          method: "GET",
        });

        if (!res.ok) {
          // Manejo de respuestas no exitosas
          throw new Error("Network response was not ok");
        }
        const html = await res.text();
        setQrImg(html);
      } catch (error) {
        console.error("Hubo un problema con la petición fetch:", error);
      }
    };
    if (!qrImg) {
      getQr();
    }
  }, []);

  return (
    <div className=" flex justify-center items-center min-h-screen bg-orange-500">
      <div className=" flex flex-col gap-5 px-32 py-20 bg-white rounded-2xl items-center justify-center">
        {qrImg && <div dangerouslySetInnerHTML={{ __html: qrImg }} />}
        <button
          onClick={() => {
            route.push("/");
          }}
          className=" orange-btn"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
