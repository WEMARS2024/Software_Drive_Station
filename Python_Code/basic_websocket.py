import asyncio
import websockets

clients = set()

async def handler(websocket):
    clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        clients.remove(websocket)

async def main():
    async with websockets.serve(handler, "0.0.0.0", 5000):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())

