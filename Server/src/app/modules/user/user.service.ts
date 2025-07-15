import { prisma } from '../../middleware/prisma';
import { IUser } from './user.interface';
import bcrypt from 'bcrypt';


export const createUser = async (data:any) => {

    const hashedPassword: string = await bcrypt.hash(data.password, 12)
    const userData = {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        
    }
    const result = await prisma.user.create({ data: userData });
  return result;
};

const getAllUsers= async()=>{
    const users = await prisma.user.findMany();
    return users; 
}


const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
    });
    return user;
};

const updateUser = async (id: string, data: any) => {

  const userData = {
    email: data.email,
    name: data.name,
    
    
}
    const user = await prisma.user.update({
        where: {
            id: id,
        },
        data: userData,
    });
    return user;
};
const deleteUser = async (id: string) => {
    const user = await prisma.user.delete({
        where: {
            id: id,
        },
    });
    return user;    
}

const findUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    return user;
};



export const userService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  findUserByEmail,


}