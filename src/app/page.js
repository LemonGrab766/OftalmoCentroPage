"use client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [message, setMessage] = useState("");
  const [selectFile, setSelectFile] = useState("");
  const [cursorPosition, setCursorPosition] = useState("noSelect");

  const [messageSuccesful, setMessageSuccesful] = useState("");
  const [error, setError] = useState("");
  const [processMessage, setProcessMessage] = useState(false);
  const [values, setValues] = useState([]);
  const [uniqueValues, setUniqueValues] = useState([]);

  const processMessageRef = useRef(processMessage);

  useEffect(() => {
    processMessageRef.current = processMessage;
  }, [processMessage]);

  useEffect(() => {
    const getProcess = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_URL_SERVER}/process-messages`
        );

        if (data !== processMessageRef.current) {
          setProcessMessage(data);
          if (!data) {
            setMessageSuccesful("El Envio de mensajes a terminado");
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    const intervalId = setInterval(getProcess, 20000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const storedMessage = localStorage.getItem("savedMessage");

    if (storedMessage) {
      setMessage(storedMessage);
    } else {
      const defaultMessage =
        "Hola, {paciente}:\nTe recordamos que el martes tenés un turno con la Dra. {profesional}.\n\n📆{fecha} a las {hora}.\n\n🏥Presencial en Felipe Erdman 485 Villa Dolores\n\n👉🏻¿No podes asistir?\ncancélalo con mas de 24 horas de anticipación.\n\n⚠️ Este mensaje es automático, no es necesario responder. Si ya has cancelado tu turno o lo has reagendado, simplemente ignora este mensaje.";

      localStorage.setItem("savedMessage", defaultMessage);

      setMessage(defaultMessage);
    }
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

  useEffect(() => {
    if (!values || values.length === 0) return; // Asegurarse de que haya archivos antes de procesar

    const processFiles = async () => {
      const allData = []; // Arreglo para almacenar todos los datos

      for (const file of values) {
        try {
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length > 0) {
              const firstObject = jsonData[0];
              const fecha = firstObject.__EMPTY_4;
              const doctor = firstObject.__EMPTY_8;

              // Agregar fecha y doctor a cada objeto en jsonData
              const enrichedData = jsonData.map((item) => ({
                ...item,
                fecha: fecha, // Asigna la fecha
                doctor: doctor, // Asigna el doctor
              }));

              allData.push(...enrichedData);
            }
          };

          reader.onerror = (readerError) => {
            console.error("Error leyendo el archivo:", readerError);
          };
        } catch (error) {
          console.error("Error procesando archivo:", error);
        }
      }

      // Esperar a que todos los archivos sean leídos
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar un tiempo prudente

      const timeGroups = {};
      console.log(allData, "data");
      // Filtrar duplicados (ejemplo usando un atributo 'id' como clave)
      allData.forEach((item) => {
        const id = item.__EMPTY_1; // El ID
        const hour = item.__EMPTY; // La hora en formato decimal

        // Si ya existe un grupo para este ID
        if (timeGroups[id]) {
          const existingHour = timeGroups[id].__EMPTY; // La hora existente para comparación

          // Verificar si la diferencia está dentro del rango de 6 horas (0.25 en decimal)
          if (Math.abs(hour - existingHour) <= 0.25) {
            // Si está dentro del rango, comparar las horas
            if (hour < existingHour) {
              timeGroups[id] = item; // Guarda el item actual si su hora es menor
            }
          } else {
            timeGroups[id + "r"] = item; // Guarda el item actual si su hora es menor
          }
        } else {
          // Si no existe un grupo, agregar el item
          timeGroups[id] = item;
        }
      });

      // Convertir el objeto de vuelta a un arreglo
      const uniqueData = Object.values(timeGroups)

      setUniqueValues(uniqueData.sort(
        (a, b) => a.__EMPTY - b.__EMPTY
      )); // Aquí tendrás tus datos únicos
    };

    processFiles();
  }, [values]);

  console.log(values);
  console.log(uniqueValues);

  const updateMessage = async () => {
    const newMessage = message;

    localStorage.setItem("savedMessage", newMessage);

    const storedMessage = localStorage.getItem("savedMessage");

    if (storedMessage) {
      setMessageSuccesful("Mensaje actualizado");
    } else {
      setError("Error al actualizar el mensaje");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (processMessage) {
        return setError("El proceso de envio debe terminar");
      }
      if (!uniqueValues.length) {
        return setError("El proceso de registro de horarios debe terminar");
      }
      // const file = event.target.file.files[0];

      // const reader = new FileReader();
      // reader.readAsArrayBuffer(file);
      // reader.onload = async (e) => {
      //   const data = new Uint8Array(e.target.result);
      //   const workbook = XLSX.read(data, { type: "array" });
      //   const firstSheetName = workbook.SheetNames[0];
      //   const worksheet = workbook.Sheets[firstSheetName];
      //   const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formData = {
        messageTemplate: message,
        data: uniqueValues,
      };

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_URL_SERVER}/send-messages`,
          formData
        );
        setProcessMessage(true);
        setMessageSuccesful(response.data.message);
      } catch (postError) {
        console.error("Error posting data:", postError);
        setProcessMessage(false);
        setError("Error al enviar los datos");
      }
      // };

      // reader.onerror = (error) => {
      //   console.error("Error reading file:", error);
      //   setError("Error al leer el archivo");
      // };
    } catch (error) {
      console.error("Error handling submit:", error);
      setError("Error al mandar mensajes");
    }
  };

  const cancelSend = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_URL_SERVER}/cancel-messages`);
      setMessageSuccesful("Mensajes cancelados");
    } catch (error) {
      setError("Ocurrio un error");
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

  console.log(uniqueValues);

  return (
    <div className=" bg-orange-500 flex flex-wrap items-center justify-around min-h-screen p-10 gap-y-10">
      <div className=" flex flex-col justify-around bg-white  rounded-2xl p-10">
        <label className=" text-center text-[30px] mb-4 font-bold">
          Mensaje
        </label>
        <div className=" flex flex-wrap justify-center max-w-[500px] gap-4 m-3 ">
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
          <button
            name="{dia}"
            onClick={(ev) => insertText(ev.target.name)}
            className="orange-btn"
          >
            {"{dia}"}
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
          className=" h-40 w-[500px] bg-orange-500 hover:bg-orange-600 cursor-pointer flex flex-col
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
            onChange={(ev) => {
              const selectedFiles = ev.target?.files;
              if (selectedFiles && selectedFiles.length > 0) {
                const fileNames = Array.from(selectedFiles).map(
                  (file) => file.name
                );
                setSelectFile(fileNames.join(", "));
                setValues(Array.from(selectedFiles));
              }
            }}
            type="file"
            name="file"
            accept=".xls, .xlsx"
            multiple
            required
            className="hidden"
          />
        </label>
        <p className=" flex-1 mb-2">{selectFile}</p>
        <div className=" w-full flex flex-wrap justify-around">
          <button onClick={cancelSend} type="button" className="red-btn">
            Cancelar
          </button>
          <button
            type="submit"
            className={`${processMessage ? "gray-btn" : "orange-btn"} `}
          >
            Subir y procesar
          </button>
        </div>
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
