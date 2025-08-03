import IMUData from '../components/IMU_Data.js';
import GPSMap from "../components/Maps.js";

function Sensors() {

    return (
        <div className="bg-gray-900 min-h-screen">

        <div className="pt-16 p-8 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">

            {/* GPS Map Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-purple-300 text-xl font-semibold mb-4">GPS Map</h2>
            <div className="bg-black p-4 rounded-md shadow-md">
                <GPSMap />
            </div>
            </div>

        </div>

        </div>
  );
}

export default Sensors;
