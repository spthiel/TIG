import React from "react";
import Preview from "./Preview";
import {makeStyles} from "@material-ui/core/styles";

const useStyle = makeStyles(theme => ({
    root: {
        padding: 10,
        overflow: 'auto'
    }
}));

export default function View(props) {

    let classes = useStyle();

    return (
        <div className={classes.root}>
            {props.resolutions.filter(resolution => {
                if(typeof resolution.group === "string") {
                    return resolution.group === props.group
                } else {
                    for (let group of resolution.group) {
                        if(group === props.group) {
                            return true;
                        }
                    }
                }
                return false;
            }).map(resolution => {
                return <Preview setPosition={(position) => props.onPositionChange(resolution.i, position)} image={props.image} overlay={resolution.image} resolution={resolution} key={resolution.image}/>
            })}
        </div>
    );
}