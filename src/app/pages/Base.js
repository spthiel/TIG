import React, {useEffect, useState} from "react";
import ActionMenu from "./ActionMenu";
import {
    AccountBoxRounded,
    LocalAtmRounded,
    PersonRounded,
    PhotoLibraryRounded,
    PlusOneRounded
} from "@material-ui/icons";
import View from "./View";
import {makeStyles} from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {buildImages} from "./GenerateImages";
import CircularProgress from "@material-ui/core/CircularProgress";
import * as Listener from "./ImageListeners";

const resolutions = [
    {
        "image": "profile_template.png",
        "width": 600,
        "height": 600,
        "description": "600x600 Profile view",
        "group": ["Profile", "All"]
    },
    {
        "image": "levelup_template.png",
        "width": 740,
        "height": 128,
        "description": "740x128 Levelup view",
        "group": ["Level up", "All"]
    },
    {
        "image": "rank_template.png",
        "width": 740,
        "height": 260,
        "description": "740x260 Rank view",
        "group": ["Rank", "All"]
    },
    {
        "image": "wallet_template.png",
        "width": 640,
        "height": 400,
        "description": "640x400 Wallet view",
        "group": ["Wallet", "All"]
    }
]


//Listener.setup(resolutions);

const groups = [
    {icon: <PhotoLibraryRounded/>, name: 'All'},
    {icon: <AccountBoxRounded/>, name: 'Profile'},
    {icon: <PlusOneRounded/>, name: 'Level up'},
    {icon: <PersonRounded/>, name: 'Rank'},
    {icon: <LocalAtmRounded/>, name: 'Wallet'},
]

window.resolutions = resolutions;

let useStyle = makeStyles(theme => ({
    paper: {
        width: '100vw',
        height: '100vh',
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column'
    },
    title: {
        flexGrow: 1,
    },
    imgur: {
        overflow: "hidden",
        paddingLeft: 5,
        textDecoration: "none",
        '& h6': {
            color: "white",
            overflow: "hidden",
            textOverflow: "ellipsis"
        }
    },
    progress: {
        color: theme.palette.primary.contrastText
    }
}));

let setup = (count, image) => {
    let out = {};
    for (let i = 0; i < count; i++) {
        let zoom = undefined;
        if (image) {
            let zoomX = image.width - resolutions[i].width;
            let zoomY = image.height - resolutions[i].height;
            zoom = Math.min(zoomX, zoomY) / 2;
        }
        out[i] = {x: 0, y: 0, zoom: zoom};
    }
    return out;
}

export default function Base() {

    let [group, setGroup] = useState(groups[1].name);
    let [image, setImage] = useState(null);
    let [positions, setPosition] = useState(setup(resolutions.length));
    let [imgurURL, setImgurURL] = useState(null);
    let [loading, setLoading] = useState(false);

    let classes = useStyle();

    let handleViewChange = (view) => {
        setGroup(view);
    }

    const handleFileUpload = (file) => {
        let fileReader = new FileReader();
        fileReader.onloadend = (e) => {
            let img = new Image();
            img.onload = () => {
                let image = {image: e.target.result, width: img.naturalWidth, height: img.naturalHeight};
                setPosition(setup(resolutions.length, image));
                setImage(image);
            }
            img.src = e.target.result;
        }
        fileReader.readAsDataURL(file);
    }

    const handlePositionChange = (i, newPosition) => {
        setPosition({...positions, [i]: newPosition});
    }

    const handleUpload = () => {
        setLoading(true);
        buildImages(image, positions, resolutions)
            .then(objects => {
                return Promise.all(objects.map(({uri, resolution}) => {
                    uri = uri.replace(/^data:image\/.+?;base64,/, "");
                    let myHeaders = new Headers();
                    myHeaders.append("Authorization", "Client-ID 58673e7a99fb03d");

                    let formdata = new FormData();
                    formdata.append("image", uri);
                    formdata.append("name", resolution.image);
                    formdata.append("description", resolution.description);

                    let requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: formdata,
                        redirect: 'follow'
                    };

                    return fetch("https://api.imgur.com/3/image", requestOptions)
                        .then(response => response.json())
                }))
            })
            .then(jsons => {
                console.log(jsons);
                let myHeaders = new Headers();
                myHeaders.append("Authorization", "Client-ID 58673e7a99fb03d");

                let formdata = new FormData();
                jsons.map(json => json.data.deletehash).forEach(hash => formdata.append("deletehashes[]", hash));
                formdata.append("cover", jsons[0].data.deletehash);

                let requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: formdata,
                    redirect: 'follow'
                };

                return fetch("https://api.imgur.com/3/album", requestOptions)
                    .then(response => response.json())
            })
            .then(json => {
                setLoading(false);
                setImgurURL(`https://imgur.com/a/${json.data.id}`);
            });
    }

    console.log("Refresh");

    return (
        <div className={classes.paper}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        {group}
                    </Typography>
                    {loading ?
                        <CircularProgress className={classes.progress}/> :
                        <a target="_blank" rel="noopener noreferrer" href={imgurURL}
                           className={classes.imgur}>
                            <Typography variant="h6">
                                {imgurURL}
                            </Typography>
                        </a>
                    }
                </Toolbar>
            </AppBar>
            <View resolutions={resolutions.map((resolution, i) => {
                resolution.position = positions[i];
                resolution.i = i;
                return resolution
            })} group={group} image={image} onPositionChange={handlePositionChange}>
            </View>
            <ActionMenu groups={groups} onClick={handleViewChange} onFileUpload={handleFileUpload}
                        onUpload={handleUpload}/>
        </div>
    )
}