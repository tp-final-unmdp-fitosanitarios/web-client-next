// utils/offlineQueue.js
export async function getPendingFinishAppIds(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const openReq = window.indexedDB.open("workbox-background-sync");
    openReq.onsuccess = function () {
      const db = openReq.result;
      const tx = db.transaction("requests", "readonly");
      const store = tx.objectStore("requests");
      const req = store.getAll();
      req.onsuccess = function () {
        // Filtrá solo los requests que sean de finalizar aplicación
        const finishAppIds = req.result
          .map(entry => {
            // Según cómo guardaste la request, extraé el ID de la URL:
            const url = entry.requestData?.url;
            const match = url?.match(/\/applications\/([a-zA-Z0-9-]+)\/finish/);
          console.log("Request data:", entry.requestData);
          console.log("Match result:", match);
            return match ? match[1] : null;
          })
          .filter(Boolean);
        resolve(finishAppIds);
      };
      req.onerror = reject;
    };
    openReq.onerror = reject;
  });
}
