import asyncio
import websockets
import json
import subprocess
import gi

gi.require_version('Gst', '1.0')
from gi.repository import Gst

Gst.init(None)

async def send_to_client(websocket, data):
    message = json.dumps(data)
    await websocket.send(message)

def on_sdp_answer(promise, webrtcbin, websocket):
    promise.wait()
    reply = promise.get_reply()
    answer = reply.get_value("answer")
    webrtcbin.set_local_description(answer)
    print("Server SDP data saved!")
    asyncio.create_task(send_to_client(websocket, {"type": "answer", "sdp": answer.sdp}))

def on_ice_candidate(webrtcbin, mlineindex, candidate, websocket):
    print("New ICE candidate from server")
    asyncio.create_task(send_to_client(websocket, {
        "type": "candidate",
        "candidate": candidate,
        "sdpMLineIndex": mlineindex
    }))

async def signaling_server(websocket, path):
    print("Connection Started")

    #Initialize Gstreamer Pipeline woohoo!
    pipeline = Gst.parse_launch(
            "v4l2src device=/dev/video4 ! videoconvert ! vp8enc ! rtpvp8pay ! webrtcbin name=sendrecv stun-server=stun://stun.l.google.com:19302"
    )
    webrtcbin = pipeline.get_by_name("sendrecv")
    pipeline.set_state(Gst.State.PLAYING)

    webrtcbin.connect("on-ice-candidate", on_ice_candidate, websocket)

    try:
        while True:

            #Wait for SDP and ICE from Client
            message = await websocket.recv()

            #Error handling
            if not message:
                print("Received empty message")
                continue

            #Convert from json to string, error handling if message isn't JSON
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                print(f"Received non-JSON message: {message}")
                continue


            #Handle sdp offers and answers
            if data.get("type") == "offer":
                print("Received Clients SDP Offer")
                sdp_string = data.get("sdp")
                offer = GstSdp.SDPMessage.new_from_text(sdp_string)
                webrtcbin.set_remote_description(offer)
                print("Client SDP data saved")
                webrtcbin.create_answer(None, on_sdp_answer, webrtcbin, websocket)
                print("SDP data sent")

            #Handle Ice candidates offers and answers
            elif data.get("type") == "candidate":
                print("Received Clients ICE Candidates!")
                candidate = data.get("candidate")
                mlineindex = data.get("sdpMLineIndex")
                if candidate and mlineindex is not None:
                    webrtcbin.add_ice_candidate(mlineindex, candidate)

    except websockets.ConnectionClosed:
        print("Client disconnected")

# Start the WebSocket server
start_server = websockets.serve(signaling_server, "localhost", 8765)

# Keep running 
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
