import {createMuiTheme} from "@material-ui/core";
import {light} from "@material-ui/core/styles/createPalette";

let lightTheme = createMuiTheme({
    palette: {
        type: 'light'
    },
});

lightTheme.palette.background.contrast = "#999999"
lightTheme.palette.background.contrastText = "#fff"

let darkTheme = createMuiTheme({
    palette: {
        type: 'dark'
    },
});

darkTheme.palette.background.contrast = "#555"
darkTheme.palette.background.contrastText = "#fff"

export default function Themes(dark) {
    return dark ? darkTheme : lightTheme;
}