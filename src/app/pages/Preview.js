import React, {useEffect, useState} from "react";
import Box from "@material-ui/core/Box";
import Image from "./Image";

export default function Preview(props) {

    const position = props.resolution.position;



    return (
        <Box >
            <Image image={props.image} position={position} setPosition={props.setPosition} resolution={props.resolution}/>
        </Box>
    )
}