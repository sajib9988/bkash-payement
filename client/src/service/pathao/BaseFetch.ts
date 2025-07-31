
const getAccessToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value;
};

export const baseFetch= (path:String, option:RequestInit ={})=>{



}