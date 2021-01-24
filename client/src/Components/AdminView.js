import React, { useState } from 'react'

export default function AdminView(props) {
    const [email, setEmail] = useState('');

    const handleSubmit = (event) => {
        props.socket.sendUpgradeToArtistRequest(email);
        event.preventDefault();
        setEmail('');
    }

    const handleChange = (event) => {
        setEmail(event.target.value);
    }
    return (
        <form onSubmit={handleSubmit}>
            <h4>Upgrade user to artist</h4>
            <label>
                Email:
                <input type='text' value={email} onChange={handleChange} />
            </label>
            <input type='submit' value='Submit' />
        </form>
    )
}
