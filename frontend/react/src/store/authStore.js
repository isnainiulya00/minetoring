import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
clearTokens,
setTokens,
getAccessToken,
isTokenExpired
} from '../api/axios'

import { STORAGE_KEYS } from '../utils/constants'

import { authService } from '../services/authService'

export const useAuthStore=create(
persist(
(set,get)=>({

user:null,

isAuthenticated:false,

isLoading:false,

login:async(username,password)=>{

set({isLoading:true})

try{

const {access,refresh}=await authService.login(
username,
password
)

setTokens(access,refresh)

const user=await authService.getMe()

localStorage.setItem(
STORAGE_KEYS.USER,
JSON.stringify(user)
)

set({

user,

isAuthenticated:true,

isLoading:false

})

return{
success:true,
user
}

}catch(error){

set({
isLoading:false
})

throw error

}

},

logout:()=>{

clearTokens()

set({
user:null,
isAuthenticated:false
})

},

loadUser:async()=>{

const token=getAccessToken()

if(
!token ||
isTokenExpired(token)
){

get().logout()

return false
}

try{

const cached=
localStorage.getItem(
STORAGE_KEYS.USER
)

if(cached){

set({

user:JSON.parse(cached),

isAuthenticated:true

})

}

const user=
await authService.getMe()

localStorage.setItem(
STORAGE_KEYS.USER,
JSON.stringify(user)
)

set({

user,

isAuthenticated:true

})

return true

}catch{

get().logout()

return false

}

},

updateUser: (newUserData) => {
  // 1. Ambil data user lama yang ada di brankas saat ini
  const currentUser = get().user

  // 2. Gabungkan data lama dan data baru (yang baru akan menimpa yang lama)
  const mergedUser = { ...currentUser, ...newUserData }

  // 3. Simpan ke LocalStorage
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mergedUser))

  // 4. Update brankas Zustand
  set({ user: mergedUser })
}

}),
{
name:'mine-toring-auth',

partialize:(state)=>({

user:state.user,

isAuthenticated:
state.isAuthenticated

})

}
)
)