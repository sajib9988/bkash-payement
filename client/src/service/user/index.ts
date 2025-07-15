"use server"

import { cookies } from 'next/headers';



export const getAllUsers = async () => {
  const accessToken = (await cookies()).get('accessToken')?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/user`, {
      headers: {
        Authorization: accessToken as string,
      },
      next: { tags: ['USER'] },
    });

    return res.json();
  } catch (error: any) {
    return Error(error);
  }
};

export const getUserById = async (id: string) => {
  const accessToken = (await cookies()).get('accessToken')?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/user/${id}`, {
      headers: {
        Authorization: accessToken as string,
      },
      next: { tags: ['USER'] },
    });

    return res.json();
  } catch (error: any) {
    return Error(error);
  }
};

export const updateUser = async (id: string, data: any) => {
  const accessToken = (await cookies()).get('accessToken')?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/user/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken as string,
      },
      body: JSON.stringify(data),
      next: { tags: ['USER'] },
    });

    return res.json();
  } catch (error: any) {
    return Error(error);
  }
};

export const deleteUser = async (id: string) => {
  const accessToken = (await cookies()).get('accessToken')?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/user/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: accessToken as string,
      },
      next: { tags: ['USER'] },
    });

    return res.json();
  } catch (error: any) {
    return Error(error);
  }
};

export const findUserByEmail = async (email: string) => {
  const accessToken = (await cookies()).get('accessToken')?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/user/${email}`, {
      headers: {
        Authorization: accessToken as string,
      },
      next: { tags: ['USER'] },
    });

    return res.json();
  } catch (error: any) {
    return Error(error);
  }
};
