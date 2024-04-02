"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [error, setError] = useState("");

  const route = useRouter();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const email = ev.target.elements.email.value;
    const password = ev.target.elements.password.value;

    try {
      // const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/login`, {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
          credentials: "include",
        }
      );
      if (response.status === 200) {
        route.push("/");
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className=" bg-orange-500 min-h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className=" flex flex-col gap-5  px-28 py-20 w-[500px] bg-white rounded-2xl "
      >
        <h1 className=" text-center text-[30px] text-orange-500">
          Iniciar Sesion
        </h1>
        <input
          name="email"
          className=" border-2 border-orange-500 rounded-2xl p-3"
        />
        <input
          name="password"
          type="password"
          className=" border-2 border-orange-500 rounded-2xl p-3"
        />
        <button className=" orange-btn mx-10 ">subir</button>
      </form>

      {error && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
