import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { AppContext } from '../context/AppContext.jsx';

const Login = () => {

  const navigate = useNavigate();

  const { backendUrl, token, setToken } = useContext(AppContext);

  const [state, setState] = useState('Sign Up');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {

      if (state === 'Sign Up') {

        const { data } = await axios.post(backendUrl + '/api/user/register', {name, email, password})
        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }

      } else {

          const { data } = await axios.post(backendUrl + '/api/user/login', {email, password})
          if (data.success) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
            toast.success(data.message);
          } else {
            toast.error(data.message);
          }

      }
      
    } catch (error) {
      toast.error(error.message);
    }

  } 

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token])

  return (
    <form className='min-h-[80vh] flex items-center' onSubmit={onSubmitHandler}>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-sm text-zinc-600 shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'login'} to book appointment.</p>

        {
          state === 'Sign Up' && <div className='w-full'>
          <p>Full Name</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' value={name} onChange={(e) => setName(e.target.value)} type="text" required/>
        </div>
        }
        

        <div className='w-full'>
          <p>Email</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' value={email} onChange={(e) => setEmail(e.target.value)} type="email" required/>
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' value={password} onChange={(e) => setPassword(e.target.value)} type="password" required/>
        </div>

        <button 
        className='bg-primary text-white w-full py-2 rounded-md text-base hover:translate-y-[5px] transition-all duration-300 cursor-pointer'
        type='submit'
        >
        {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {
          state === 'Sign Up'
          ? <p className='text-sm'>Already have an account? <span onClick={() => setState('Login')} className='text-primary cursor-pointer'>Login</span></p>
          : <p className='text-sm'>Create a new account? <span onClick={() => setState('Sign Up')} className='text-primary cursor-pointer'>Sign Up</span></p>
        }

      </div>
    </form>
  )
}

export default Login