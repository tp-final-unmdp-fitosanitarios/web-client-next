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

        const pendingRaw = await getItem<unknown>(pendingKey);
        if (pendingRaw) {
            const match = urlPath.match(/^\/?applications\/([^\/]+)\/status$/);
            if (match) {
                const id = match[1]; //ID como string
                console.log("hay match");
                
                // Normalizar PENDING a arreglo
                const isResponseItemsAplicacion = (value: unknown): value is ResponseItems<Aplicacion> => {
                    return (
                        typeof value === "object" &&
                        value !== null &&
                        Array.isArray((value as { content?: unknown }).content)
                    );
                };
                const pendingIsPage = isResponseItemsAplicacion(pendingRaw);
                const pendingList: Aplicacion[] = pendingIsPage
                    ? [...(pendingRaw as ResponseItems<Aplicacion>).content]
                    : (Array.isArray(pendingRaw) ? [...(pendingRaw as Aplicacion[])] : []);

                // Encontrar índice del elemento a remover de forma explícita y segura
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
                    if (pendingIsPage) {
                        const page = pendingRaw as ResponseItems<Aplicacion>;
                        const updatedPage: ResponseItems<Aplicacion> = {
                            ...page,
                            content: pendingList,
                            number_of_elements: pendingList.length,
                            total_elements: Math.max(0, (page.total_elements ?? pendingList.length) - 1),
                            empty: pendingList.length === 0,
                        };
                        await setItem(pendingKey, updatedPage);
                        console.log(updatedPage);
                    } else {
                        await setItem(pendingKey, pendingList);
                        console.log(pendingList);
                    }
                    console.log("pendinentes guardadas en: "+pendingKey);


                    // Cargar lista IN_PROGRESS
                    const inProgressRaw = await getItem<unknown>(inProgressKey);
                    const inProgressIsPage = isResponseItemsAplicacion(inProgressRaw);
                    const inProgressApps: Aplicacion[] = inProgressIsPage
                        ? [...(inProgressRaw as ResponseItems<Aplicacion>).content]
                        : (Array.isArray(inProgressRaw) ? [...(inProgressRaw as Aplicacion[])] : []);
                    console.log(inProgressApps);
                    // Asegurar unicidad por id y agregar el movido
                    const alreadyExistedInProgress = inProgressApps.some((application) => application.id === movedApp.id);
                    const updatedInProgressApps: Aplicacion[] = [
                        ...inProgressApps.filter((application) => application.id !== movedApp.id),
                        movedApp,
                    ];

                    await removeItem(inProgressKey);
                    if (inProgressIsPage) {
                        const page = inProgressRaw as ResponseItems<Aplicacion>;
                        const updatedPage: ResponseItems<Aplicacion> = {
                            ...page,
                            content: updatedInProgressApps,
                            number_of_elements: updatedInProgressApps.length,
                            total_elements:
                                (typeof page.total_elements === "number" ? page.total_elements : inProgressApps.length) +
                                (alreadyExistedInProgress ? 0 : 1),
                            empty: updatedInProgressApps.length === 0,
                        };
                        await setItem(inProgressKey, updatedPage);
                    } else {
                        await setItem(inProgressKey, updatedInProgressApps);
                    }
                    console.log("aps pendientes actualkizadas en: "+inProgressKey);
                    console.log(updatedInProgressApps);
                }
            }
        }
    }
}