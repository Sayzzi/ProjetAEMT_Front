import { BrowserRouter, Route, Routes } from "react-router-dom"
import './App.css'
import {LoginFormComponent} from "./features/auth/components/LoginFormComponent.tsx";
import {FolderList} from "./features/folder/components/folderList.tsx";

function App() {

    //test
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<FolderList/>}></Route>
                <Route path="login" element={<LoginFormComponent/>}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
