import React, {useRef} from "react";
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import {makeStyles} from "@material-ui/styles";
import {ImageRounded, PublishRounded} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        pointerEvents: 'none'
    },
    speedDial: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        whiteSpace: 'nowrap',
        '& > div' : {
            '& > :last-child': {
                '& > button': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText
                },
                '& > span': {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText
                }
            },
            '& > :nth-last-child(2)': {
                '& > button': {
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText
                },
                '& > span': {
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.contrastText
                }
            },
            '& > :nth-last-child(n+3)': {
                '& > button': {
                    backgroundColor: theme.palette.background.contrast,
                    color: theme.palette.background.contrastText
                },
                '& > span': {
                    backgroundColor: theme.palette.background.contrast,
                    color: theme.palette.background.contrastText
                }
            }
        }
    }
}));

const actions = [
    {icon: <ImageRounded/>, name: 'Import image', action: 'fileUpload'},
    {icon: <PublishRounded/>, name: 'Export to imgur', action: 'imgurUpload'},
];

export default function ActionMenu(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const fileUploader = useRef(null);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClick = (name) => () => {
        for(let action of actions) {
            if(action.name === name) {
                if(action.action === "imgurUpload" && props.onUpload) {
                    props.onUpload();
                } else if(action.action === "fileUpload") {
                    if(props.onFileUpload) {
                        fileUploader.current.click()
                    }
                }
                return;
            }
        }
        if(props.onClick) {
            props.onClick(name);
        }
    }

    const handleFileChange = (event) => {
        let files = event.target.files;
        if(files && files.length > 0) {
            props.onFileUpload(files[0]);
        }

    }

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div className={classes.root}>
            {/* eslint-disable-next-line react/style-prop-object */}
            <input ref={fileUploader} hidden type="file" onChange={handleFileChange} accept="image/*"/>
            <SpeedDial
                ariaLabel="SpeedDial Actions Menu"
                className={classes.speedDial + " actionMenu"}
                icon={<SpeedDialIcon/>}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
            >
                {actions.concat(props.groups || []).filter(action => !action.disabled).reverse().map((action) => {
                        return <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            tooltipOpen
                            onClick={handleClick(action.name)}
                        />
                    }
                )}
            </SpeedDial>
        </div>
    )
}