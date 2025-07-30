// src/app/page.tsx
import { auth, signIn, signOut } from "@/auth";

// Componente para el botón de inicio de sesión
function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        // Al llamar a signIn, se debe especificar el ID del proveedor
        await signIn("bitrix24");
      }}
    >
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Iniciar Sesión con Bitrix24
      </button>
    </form>
  );
}

// Componente para mostrar info del usuario y el botón de cierre de sesión
function SignOut({ name }: { name: string | null | undefined }) {
  return (
    <div className="text-center">
      <p className="mb-4">
        Bienvenido, <span className="font-bold">{name}</span>
      </p>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button
          type="submit"
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
        >
          Cerrar Sesión
        </button>
      </form>
    </div>
  );
}

// La página principal que decide qué mostrar
export default async function Page() {
  // Obtenemos la sesión del lado del servidor usando el método auth()
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="rounded-lg border border-gray-300 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold">
          Plataforma de Analíticas
        </h1>
        {session?.user ? (
          <SignOut name={session.user.name} />
        ) : (
          <SignInButton />
        )}
      </div>
    </main>
  );
}
