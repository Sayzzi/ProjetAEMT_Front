import { BrowserRouter, Route, Routes } from "react-router-dom"
import './App.css'
import {RegisterFormComponent} from "./features/auth/components/RegisterFormComponent.tsx";

function App() {

    //test
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RegisterFormComponent />} />
                <Route path="/register" element={<RegisterFormComponent />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
