import React from 'react';
import ReactDOM from 'react-dom/client';
import {Game} from "./views/Game/Game";
import {Home} from "./views/Home/Home";
import {Routes, Route, BrowserRouter} from "react-router-dom";
import {TDEngine} from "./engine/TDEngine";
import {Box, CssBaseline} from "@mui/material";

export const ApplicationRoutes = {
    home: "/",
    game: "/game",
} as const;


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
// game engine singleton
const engine = new TDEngine();

root.render(
    <BrowserRouter>
        <CssBaseline>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    minWidth: "100vh",
                }}
            >
                <Routes>
                    <Route path={ApplicationRoutes.game} element={<Game engine={engine}/>}/>
                    <Route path={ApplicationRoutes.home} element={<Home engine={engine}/>}/>
                    <Route path="*" element={<Home engine={engine}/>}/>
                </Routes>
            </Box>
        </CssBaseline>
    </BrowserRouter>
)
