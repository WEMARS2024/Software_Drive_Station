import WeMars from "../images/WE_Mars.jpg";
import ButtonLink from '../components/buttonLink.js'
import WebRTCStream from '../components/SignallingServer.js'


function CameraPage() {

    return( 

        <div className="bg-slate-100 h-screen w-full">


            <div id="nav-bar" className="fixed top-0 left-0 bg-white h-20 w-full shadow-lg">
            <div className="flex justify-end mt-2">
                <img src={WeMars} className="fixed top-2 left-2 w-34 h-16 ml-4"></img>
                <ButtonLink to='/cameras' className="font-semibold font-serif text-2xl m-3 p-1 mr-8 rounded-xl hover:bg-purple-300 hover:shadow-lg ease-in-out duration-500">Camera's</ButtonLink>
                <ButtonLink to='/sensors' className="font-semibold font-serif text-2xl m-3 p-1 mr-8 rounded-xl hover:bg-purple-300 hover:shadow-lg ease-in-out duration-500">Sensors</ButtonLink>
                <ButtonLink to='/canInfo' className="font-semibold font-serif text-2xl m-3 p-1 mr-24 rounded-xl hover:bg-purple-300 hover:shadow-lg ease-in-out duration-500">CanBus Info</ButtonLink>
            </div>
            </div>
            <span className="fixed block w-full h-2 top-[75px] left-0 bg-gradient-to-b from-purple-500 via-purple-700 to-purple-800" />


            <div className="grid grid-cols-2 fixed top-10 h-screen w-full">
            <div className="col-span-1 flex justify-center items-center">
                <div className="relative border-solid border-4 border-purple-500 w-[800px] h-[700px] rounded-lg bg-white">
                    <WebRTCStream />
                </div>
            </div>
            </div> 

        </div>
    )

}

export default CameraPage;