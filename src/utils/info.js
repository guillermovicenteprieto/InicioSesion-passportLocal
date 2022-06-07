export function info() {
    const processInfo = {
        "argumentos de entrada": process.argv,
        "nombre de la plataforma - sistema operativo": process.platform,
        "version de node": process.version,
        "memoria total reservada rss": process.memoryUsage().rss,
        "path de ejecución": process.execPath,
        "process.id": process.pid,
        "carpeta de proyecto": process.cwd(),
    }
    return processInfo
}

/*
const objInfo = {
    argumentosEntrada : process.argv,
    carpetaProyecto : process.cwd(),
    sistemaOperativo: process.platform,
    versionNode: process.version,
    memoriaTotalReservada: process.memoryUsage().rss,
    processId : process.pid,
    pathDeEjecucion: process.title
}
*/