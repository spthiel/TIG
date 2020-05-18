import React from 'react';
import './App.css';
import {useMediaQuery} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";
import Base from "./pages/Base";
import Themes from "./Themes";

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = Themes(prefersDarkMode);

  window.theme = theme;

  return (
      <ThemeProvider theme={theme}>
        <Base/>
      </ThemeProvider>
  );
}

export default App;
