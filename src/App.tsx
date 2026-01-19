import { BrowserRouter, Route, Routes } from "react-router-dom"
import './App.css'
import {LoginComponent} from "./features/note/components/loginComponent.tsx";

function App() {

    //test
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginComponent/>}></Route>
                <Route path="login" element={<LoginComponent/>}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
