import Link from "next/link";

export default function ComprasPage() {
    return (
        <>
            <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                <h1 className="title"> PAGINA DE PROCESO DE COMPRAS</h1>
                <Link href="/home">
                    <button className="bg-blue-500 text-white p-2 rounded"> Volver </button>
                </Link>
            </div>
        </>
    )



}