import React, { useContext } from 'react'
import './Banner.css'
import './Burger.css'
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext';
import logo from '../Resources/krea-logo.png'
import { slide as Menu } from 'react-burger-menu'
const Banner = (props) => {
    const history = useHistory();
    const { auth, isAdmin } = useContext(AuthContext);
    return (
        <div className="Banner">
            <Menu>
                <p className="menu-item" onClick={() => { auth.signOut() }}> SIGN OUT </p>
                {isAdmin ? (
                    <>
                        <p className="menu-item" onClick={() => { history.push('/') }}> HOME </p>
                        <p className="menu-item" onClick={() => { history.push('/admin') }}> ADMIN PANEL </p>
                    </>
                ) : (
                        <></>
                    )
                }
                <p className="menu-item" style={{
                    marginTop: 'auto',
                    marginBottom: '50px',
                }} onClick={()=>{history.push('./removeData')}}> Delete Account </p>
            </Menu>
            <a href='https://krea.today' style={{
                    display: 'flex',
                    marginLeft: 'auto',
            }}>
                <img src={logo} alt='logo' className='Logo' />
            </a>

        </div >
    )
}

export default Banner;