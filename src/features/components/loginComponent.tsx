import {ChangeEvent, useState} from "react";

interface FormData {
    username: string
    password: string
}

export function LoginComponent() {

    //Signaux
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
    })

    // Met à jour l'état du formulaire à chaque frappe dans un input
    //Le champ modifié est identifié grâce à son attribut name
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    //Ici on va faire appel au service
    function handleSubmit() {
        alert("Login successfully"+formData.username)
    }

    return (
        <>
            <form action="" onSubmit={handleSubmit}>
                <div>
                    <input type="text" name="username" onChange={handleChange} value={formData.username}/>
                </div>
                <div>
                    <input type="text" name="password" onChange={handleChange} value={formData.password}/>
                </div>
                <button type="submit">Se connecter</button>
            </form>
        </>
    )
}
