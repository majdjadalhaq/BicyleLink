import PropTypes from "prop-types";
import UserTableRow from "./UserTableRow";

const UserDesktopTable = ({
  users,
  currentUser,
  handleToggleBlock,
  setSelectedUserForWarning,
  handleViewWarnings,
  handleToggleRole,
}) => {
  return (
    <div className="hidden lg:block bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#2a2a2a] overflow-hidden shadow-2xl relative">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 dark:bg-black/20 text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100 dark:border-white/5">
            <th className="px-8 py-5 w-72">User</th>
            <th className="px-8 py-5 w-64">Email</th>
            <th className="px-8 py-5 w-32 text-center">Role</th>
            <th className="px-8 py-5 w-32 text-center">Status</th>
            <th className="px-8 py-5 text-right pr-12">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {users.map((user) => (
            <UserTableRow
              key={user._id}
              user={user}
              currentUser={currentUser}
              handleToggleBlock={handleToggleBlock}
              setSelectedUserForWarning={setSelectedUserForWarning}
              handleViewWarnings={handleViewWarnings}
              handleToggleRole={handleToggleRole}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

UserDesktopTable.propTypes = {
  users: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
  handleToggleBlock: PropTypes.func.isRequired,
  setSelectedUserForWarning: PropTypes.func.isRequired,
  handleViewWarnings: PropTypes.func.isRequired,
  handleToggleRole: PropTypes.func.isRequired,
};

export default UserDesktopTable;
