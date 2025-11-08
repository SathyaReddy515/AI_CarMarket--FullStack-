import React from 'react'
import AddCarForm from '../_components/add-car-form';

export const metadata = {
  title: " Add New Car | Vehiql Admin",
  description: " Add a New Car in Vehiql Admin Panel",
};
const AddCarpage = () => {
  return (
    <div className="p-6">
        <h1 className='text-2xl font-bold mb-6'>Add New Car
            <AddCarForm/>
        </h1>
    </div>
  )
}

export default AddCarpage;