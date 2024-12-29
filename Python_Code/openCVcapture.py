import cv2

cap = cv2.VideoCapture("udp://@0.0.0.0:5000?buffer_size=65536", cv2.CAP_FFMPEG)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to receive frame")
        break
    cv2.imshow('Received Video', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()