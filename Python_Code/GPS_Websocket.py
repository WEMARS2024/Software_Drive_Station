import asyncio
import serial
import websockets
import json

SERIAL_PORT = "COM14"
BAUD_RATE = 115200
clients = set()

async def serial_reader():
    """Reads from the serial port and sends GPS data to WebSocket clients."""
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0.1)
    while True:
        raw = await asyncio.to_thread(ser.readline)
        line = raw.decode('utf-8', errors='ignore').strip()

        if "Latitude:" in line:
            try:
                latitude = float(line.split("Latitude:")[1].strip())
                raw2 = await asyncio.to_thread(ser.readline)
                lon_line = raw2.decode('utf-8', errors='ignore').strip()

                if "Longitude:" in lon_line:
                    longitude = float(lon_line.split("Longitude:")[1].strip())
                    payload = json.dumps({"latitude": latitude, "longitude": longitude})
                    print(f"Sending: {payload}")
                    await broadcast(payload)
            except Exception as e:
                print("Parse error:", e)

        await asyncio.sleep(0)

async def broadcast(message):
    """Send the GPS data to all connected WebSocket clients."""
    if not clients:
        return
    disconnected = set()
    for client in list(clients):
        try:
            await client.send(message)
        except websockets.exceptions.ConnectionClosed:
            disconnected.add(client)
    clients.difference_update(disconnected)

async def handler(websocket, path):
    """Handles WebSocket connections."""
    print("New connection established")
    clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        print("Connection closed")
        clients.discard(websocket)

async def main():
    server = await websockets.serve(handler, "0.0.0.0", 5000)
    print("WebSocket server started on ws://localhost:5000")

    serial_task = asyncio.create_task(serial_reader())
    try:
        await server.wait_closed()
    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        serial_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await serial_task

if __name__ == "__main__":
    import contextlib
    asyncio.run(main())
