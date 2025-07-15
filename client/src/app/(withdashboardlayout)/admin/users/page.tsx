// app/admin/users/page.tsx

import { UserTable } from '@/module/UserTable/UserTable';
import { getAllUsers } from '@/service/user';
import { User } from '@/type/type';

const UsersPage = async () => {
  const users = await getAllUsers(); // fetch users from API

  // Optional: If API returns `{ data: [...] }`
  // const users: User[] = users.data || [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <UserTable   data={users.data as User[]} />
    </div>
  );
};

export default UsersPage;
