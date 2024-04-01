"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [selectFile, setSelectFile] = useState("");
  const [cursorPosition, setCursorPosition] = useState("noSelect");

  const [messageSuccesful, setMessageSuccesful] = useState("");
  const [error, setError] = useState("");

  // console.log(cursorPosition);
  // console.log(message);
  // console.log(messageSuccesful);
  // console.log(error);

  useEffect(() => {
    fetch("/message.json")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Error al cargar el mensaje:", error);
      });
  }, []);

  useEffect(() => {
    if (messageSuccesful || error) {
      const timer = setTimeout(() => {
        setMessageSuccesful("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [messageSuccesful, error]);

  const updateMessage = async () => {
    const newMessage = { message };
    const response = await fetch("/api/update-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessage),
    });

    if (response.ok) {
      setMessageSuccesful("Mensaje actualizado");
    } else {
      setError("Error al actualizar el mensaje");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const file = event.target.file.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/send-messages`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setMessageSuccesful(data.message);
    } catch (error) {
      setError("Error al mandar mensajes");
    }
  };

  const insertText = (text) => {
    if (cursorPosition === "noSelect") {
      setMessage((prev) => prev + text);
      return;
    }
    const beforeCursor = message.substring(0, cursorPosition);
    const afterCursor = message.substring(cursorPosition);

    const newText = beforeCursor + text + afterCursor;

    setMessage(newText);

    const newCursorPosition = cursorPosition + text.length;
    setTimeout(() => setCursorPosition(newCursorPosition), 0);
  };

  return (
    <div className=" bg-orange-500 flex flex-wrap items-center justify-around min-h-screen p-10 gap-y-10">
      <div className=" flex flex-col justify-around bg-white h-[400px] rounded-2xl p-10">
        <label className=" text-center text-[30px] mb-4 font-bold">
          Mensaje
        </label>
        <div className=" flex flex-wrap gap-4 m-3">
          <button
            name="{paciente}"
            onClick={(ev) => insertText(ev.target.name)}
            className="orange-btn"
          >
            {"{paciente}"}
          </button>
          <button
            name="{profesional}"
            onClick={(ev) => insertText(ev.target.name)}
            className="orange-btn"
          >
            {"{profesional}"}
          </button>
          <button
            name="{fecha + 1}"
            onClick={(ev) => insertText(ev.target.name)}
            className="orange-btn"
          >
            {"{fecha + N}"}
          </button>
          <button
            name="{hora}"
            onClick={(ev) => insertText(ev.target.name)}
            className="orange-btn"
          >
            {"{hora}"}
          </button>
        </div>
        <textarea
          onChange={(ev) => {
            setMessage(ev.target.value);
          }}
          onKeyUp={(ev) => {
            setCursorPosition(ev.target.selectionStart);
          }}
          onClick={(ev) => {
            setCursorPosition(ev.target.selectionStart);
          }}
          value={message}
          type="text"
          name="message"
          required
          className=" h-52 w-[500px] border-2 border-orange-500 rounded-lg p-1 mb-4"
        />
        <div className=" text-center">
          <button onClick={updateMessage} className="orange-btn">
            Guardar Mensaje
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className=" flex flex-col bg-white p-10 h-[400px] rounded-2xl  items-center justify-around"
      >
        <label className=" text-center text-[30px] mb-2 font-bold">
          Archivo
        </label>
        <label
          className=" h-40 w-[500px] bg-orange-500 hover:bg-orange-400 cursor-pointer flex flex-col
         text-center text-white font-bold items-center justify-center
          text-[30px] gap-1 text-primary rounded-2xl  mb-2 border border-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            // className="w-6 h-6"
            style={{ width: "60px", height: "60px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Añadir archivo xlsx</div>
          <input
            onChange={(ev) => setSelectFile(ev.target.files[0].name)}
            type="file"
            name="file"
            accept=".xlsx"
            required
            className="hidden"
          />
        </label>
        <p className=" flex-1 mb-2">{selectFile}</p>
        <button type="submit" className="orange-btn">
          Subir y procesar
        </button>
      </form>

      {!messageSuccesful && error && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded-md">
          {error}
        </div>
      )}
      {!error && messageSuccesful && (
        <div className="fixed bottom-4 left-4 bg-green-500 text-white p-2 rounded-md">
          {messageSuccesful}
        </div>
      )}
    </div>
  );
}
