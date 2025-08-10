import { Aplicacion } from "@/domain/models/Aplicacion";
import { getItem, setItem } from "./indexedDB";


export const actualizaAplicaciones = async (req: Request) => {
    const urlPath = new URL(req.url).pathname;

    if (/^\/?applications\/[^\/]+\/status$/.test(urlPath)) {
        const requestClone = req.clone();

        let bodyData = null;
        try {
            bodyData = await requestClone.json(); // Si el body es JSON
        } catch (e) {
            // Manejo en caso de que no sea JSON
            void e; // mark error as intentionally unused for linting
            const text = await requestClone.text();
            bodyData = text;
        }

        const apps = await getItem<Aplicacion[]>("/applications?status=PENDING&page=0&size=10");
        if(apps){
            const match = urlPath.match(/^\/?applications\/([^\/]+)\/status$/);
            if (match) {
                const id = match[1]; //ID como string
                console.log("ID de la aplicación:", id);
                
                const ap = apps.find(ap => ap.id === id);
                if(ap){
                    ap.status = bodyData.status
                    setItem("/applications?status=PENDING&page=0&size=10", apps);
                }
            }
        }
    }
}