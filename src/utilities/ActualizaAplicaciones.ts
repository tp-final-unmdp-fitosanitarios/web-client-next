import { Aplicacion } from "@/domain/models/Aplicacion";
import { getItem, setItem, removeItem } from "./indexedDB";
import { EstadoAplicacion } from "@/domain/enum/EstadoAplicacion";
import { ResponseItems } from "@/domain/models/ResponseItems";


export const actualizaAplicaciones = async (req: Request) => {
    const urlPath = new URL(req.url).pathname;
    console.log("actualizando apps");

    if (/^\/?applications\/[^\/]+\/status.*$/.test(urlPath)) {
        const requestClone = req.clone();

        let bodyData: unknown = null;
        try {
            bodyData = await requestClone.json(); // Si el body es JSON
        } catch (e) {
            // Manejo en caso de que no sea JSON
            void e; // mark error as intentionally unused for linting
            const text = await requestClone.text();
            bodyData = text as string;
        }

        const pendingKey = "/applications?status=PENDING&page=0&size=10";
        const inProgressKey = "/applications?status=IN_PROGRESS&page=0&size=10";

        const pending = await getItem<ResponseItems<Aplicacion> >(pendingKey);
        if (pending) {
            const match = urlPath.match(/^\/?applications\/([^\/]+)\/status$/);
            if (match) {
                const id = match[1]; //ID como string
                
                // Encontrar índice del elemento a remover de forma explícita y segura
                const pendingList = pending.content;
                const removeIndex = pendingList.findIndex((application) => application.id === id);
                if (removeIndex !== -1) {
                    console.log("eliminando ap, índice:", removeIndex);
                    const [movedApp] = pendingList.splice(removeIndex, 1);
                    let newStatus: EstadoAplicacion = EstadoAplicacion.EnCurso;
                    if (typeof bodyData === "object" && bodyData !== null && "status" in bodyData) {
                        const statusValue = (bodyData as { status: unknown }).status;
                        if (
                            typeof statusValue === "string" &&
                            (Object.values(EstadoAplicacion) as string[]).includes(statusValue)
                        ) {
                            newStatus = statusValue as EstadoAplicacion;
                        }
                    }
                    movedApp.status = newStatus;

                    // Guardar lista PENDING sin el elemento
                    await removeItem(pendingKey);
                    /*console.log(pendingIsPage);*/
                   
                    const updatedPage: ResponseItems<Aplicacion> = {
                        ...pending,
                        content: pendingList,
                        number_of_elements: pendingList.length,
                        total_elements: Math.max(0, (pending.total_elements ?? pendingList.length) - 1)
                    };
                    updatedPage.content = updatedPage.content.filter(app => app.id!=movedApp.id);
                    await setItem(pendingKey, updatedPage);
                    console.log(updatedPage);
                    
                    console.log("pendinentes guardadas en: "+pendingKey);


                    // Cargar lista IN_PROGRESS
                    const inProgress = await getItem<ResponseItems<Aplicacion>>(inProgressKey);
                    if(inProgress){
                    
                    const inProgressApps = inProgress?.content;
                    console.log(inProgressApps);

                    // Asegurar unicidad por id y agregar el movido
                    const alreadyExistedInProgress = inProgressApps?.some((application) => application.id === movedApp.id);
                    if(!alreadyExistedInProgress){
                        inProgressApps?.push(movedApp);
                    }

                    await removeItem(inProgressKey);

                    const updatedPageInProgress: ResponseItems<Aplicacion> = {
                        ...inProgress,
                        content: inProgressApps? inProgressApps : [],
                        number_of_elements: inProgressApps? inProgressApps.length : 0,
                        total_elements: inProgressApps? inProgressApps.length : 0
                    };
                    await setItem(inProgressKey, updatedPageInProgress);
                    
                    console.log("aps pendientes actualkizadas en: "+inProgressKey);
                    console.log(inProgressApps);
                }
                }
            }
        }
    }
}