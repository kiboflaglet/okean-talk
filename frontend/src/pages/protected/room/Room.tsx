import React from 'react'
import { useLoaderData } from 'react-router'

const Room = () => {
  const user = useLoaderData()
  return (
    <div>
      Protected page
      {JSON.stringify(user)}
    </div>
  )
}

export default Room
