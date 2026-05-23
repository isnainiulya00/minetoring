import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

import { ROLES } from '../../utils/constants'

import LPPIKDashboard from './LPPIKDashboard'
import KMFDashboard from './KMFDashboard'
import MentorDashboard from './MentorDashboard'
import MenteeDashboard from './MenteeDashboard'

export default function Dashboard() {

  // ===============================
  // STORE
  // ===============================

  const user =
    useAuthStore((s)=>s.user)


  // ===============================
  // LOADING / EMPTY
  // ===============================

  if(!user){

    return (
      <Navigate
        to="/login"
        replace
      />
    )

  }


  // ===============================
  // ROLE BASED DASHBOARD
  // ===============================

  switch(user.role){

    case ROLES.ADMIN:

      return <LPPIKDashboard/>


    case ROLES.KMF:

      return <KMFDashboard/>


    case ROLES.MENTOR:

      return <MentorDashboard/>


    case ROLES.MENTEE:

      return <MenteeDashboard/>


    default:

      return (
        <Navigate
          to="/forbidden"
          replace
        />
      )

  }

}