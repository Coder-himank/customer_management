import { useState } from 'react';
import axios from 'axios';
// import { signup } from '../../api/auth';

import styles from "@/styles/auth.module.css"
const Signup = () => {

    const [credentials, setCredentials] = useState({
        referenceId: '',
        referencePassword: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null)
        setError(null);
        setLoading(true);


        if (credentials.password !== credentials.confirmPassword) {
            setError("Passwords do not match");
            return;
        }


        try {
            const response = await axios.post(
                "/api/auth/signup",
                {
                    username: credentials.username,
                    password: credentials.password,
                    referenceId: credentials.referenceId,
                    referencePassword: credentials.referencePassword
                }
            );

            // console.log(response.data);
            setMessage("User Account created")

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Something went wrong"
            );

        } finally {
            setLoading(false);
        }
    }
    return (
        <div className={styles.page}>
            <h1>Signup Page</h1>
            <p>Please enter your details to create an account.</p>
            <form className={styles.form}>

                {error ?? <p>{error}</p>}
                {message ?? <p>{message}</p>}
                <div className={styles.inputBlock}>
                    <label htmlFor="reference">Reference Id:</label>
                    <input type="text" id="reference" value={credentials.referenceId} onChange={(e) => setCredentials({ ...credentials, referenceId: e.target.value })} />
                </div>
                <div className={styles.inputBlock}>
                    <label htmlFor="referencePassword">Reference Password:</label>
                    <input type="password" id="referencePassword" value={credentials.referencePassword} onChange={(e) => setCredentials({ ...credentials, referencePassword: e.target.value })} />
                </div>
                <div className={styles.inputBlock}>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} />
                </div>
                <div className={styles.inputBlock}>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} />
                </div>
                <div className={styles.inputBlock}>
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input type="password" id="confirmPassword" value={credentials.confirmPassword} onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })} />
                </div>
                <button type="submit" onClick={handleSubmit} className={styles.submitButton} disabled={loading}>Signup</button>
                <Link href="/authenticate/login">alredy have a account: login</Link>
            </form>
        </div>
    );
}

export default Signup;