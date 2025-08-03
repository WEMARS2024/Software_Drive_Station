import VideoStream from "../components/WebRTCColor.js";
import ButtonLink from '../components/buttonLink.js'


function CameraPage() {

    return( 

        <div className="bg-gray-900 h-screen w-full">
            
            <VideoStream />

        </div>
    )

}

export default CameraPage;