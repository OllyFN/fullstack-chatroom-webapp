import { useState } from 'react'
import { loginProps } from '../../types'
import './styles/LoginStyles.css'
export default function Login({handleUserLogin, err, waitState}:loginProps) {
  const [name, setName] = useState('')
  const [pass, setPass] = useState('')

  return(
    <div className='login-wrapper'>
      <p className='loading' data-visible={waitState ? true : null}>Verifying credentials...</p>
      <p>Welcome!</p>
      <div className='username'>
        <p>Username<span>*</span></p>
        <input value={name} onChange={(e) => waitState==false && e.currentTarget.value.length<=16 && setName(e.currentTarget.value)} />
      </div>
      <div className='password'>
        <p>Password<span>*</span></p>
        <input type='password' value={pass} onChange={(e) => waitState==false && e.currentTarget.value.length<=16 && setPass(e.currentTarget.value)} />
      </div>
      {err!='' && <p className='error'>{err}</p>}
      <div className='button-wrapper'>
        <button onClick={() => handleUserLogin(name, pass)}>Login</button>
        {' or '}
        <button onClick={() => handleUserLogin(name, pass, true)}>Register</button>
      </div>
    </div>
  )
}