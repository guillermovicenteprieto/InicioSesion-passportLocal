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