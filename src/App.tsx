import {BrowserRouter, Route, Routes} from "react-router-dom"
import './App.css'
import AddNote from "./features/note/components/addNote.tsx";


function App() {

    //test
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AddNote userId={0} folderId={0}/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
