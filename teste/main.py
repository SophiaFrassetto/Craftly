import asyncio
import sys
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI, WebSocket, WebSocketDisconnect



app = FastAPI()

# fila global de logs
log_queue = asyncio.Queue()

process = None


async def run_process():
    global process

    process = await asyncio.create_subprocess_exec(
        "java", "-jar", ".\\servers\\vanilla\\1.21.11_MyServer\\server.jar",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )

    # lê stdout em tempo real
    while True:
        line = await process.stdout.readline()
        if not line:
            break

        decoded = line.decode(errors="ignore")
        await log_queue.put(decoded)


@app.on_event("startup")
async def startup_event():
    # inicia o processo automaticamente
    asyncio.create_task(run_process())


@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            log = await log_queue.get()
            await websocket.send_text(log)
    except WebSocketDisconnect:
        print("Cliente desconectou")