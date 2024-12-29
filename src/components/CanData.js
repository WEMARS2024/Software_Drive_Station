import React, { useState, useEffect } from 'react';



function CanDisplay() {

    const [canData, setCanData] = useState('');
    const [canValues, setCanValues] = useState({})


    useEffect(() => {

        const ws = new WebSocket("ws://192.168.0.141:7005");

        ws.onopen = () => {
            console.log("connected")
        };

        ws.onmessage = (event) => {
            setCanData(event.data);
        };

        ws.onclose = () => {
            console.log("connection closed")
        };


        return () => {
            ws.close()
        };

    }, []);

    useEffect(() => {
        if (canData) {
            handleData(canData);
        }
    }, [canData])


    const handleData = (canData) => {

        const canArray = canData.split(", ")

        const canId = canArray[0];
        const staticValues = canArray.slice(1, 6)
        const Value = canArray[6]

        setCanValues(prevIds => ({
            ...prevIds,
            [canId]: {
                staticValues,
                changingValue
            }
        }))
    }


    return (
        <div>

        </div>
    )
}

export default CanDisplay;