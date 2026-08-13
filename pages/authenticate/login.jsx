import { useState } from 'react';
import axios from 'axios';

import styles from "@/styles/auth.module.css"

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
const Login = () => {

    const [credentials, setCredentials] = useState({

        username: '',
        password: '',
    });

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)

    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true)
        setError(null)
        setMessage(null)
        // Handle signup logic here

        // send the data to the backend to create a new user account and habdle the response accordingly. You can use fetch or axios to make the API call.


        const result = await signIn("credentials", {
            username: credentials.username,
            password: credentials.password,
            redirect: false,
        });


        setLoading(false);

        if (result?.error) {
            setError("Invalid username or password");
            return;
        }

        router.push("/dashboard");

    };

    return (
        <div className={styles.page}>
            <h1>Login Page</h1>
            <p>Please enter your details to Login to your account.</p>
            <form className={styles.form}>
                {error ?? <p>{error}</p>}
                <div className={styles.inputBlock}>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} />
                </div>
                <div className={styles.inputBlock}>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} />
                </div>
                <button type="submit" onClick={handleSubmit} className={styles.submitButton} disabled={loading}>Signup</button>

                <Link href="/authenticate/signup">Create new Account: signup</Link>
            </form>
        </div>
    );
}

export default Login;