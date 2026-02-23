import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import TEST_ID from "../Nav.testid";

const NavLinks = ({ user, unreadCount }) => {
  const navItemClass = ({ isActive }) =>
    isActive ? "nav-item active" : "nav-item";

  return (
    <ul className="navbar-links">
      <li>
        <NavLink to="/" className={navItemClass}>
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/listing/create"
          className={navItemClass}
          data-testid={TEST_ID.linkToCreateListing}
        >
          Sell a Bike
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/user"
          className={navItemClass}
          data-testid={TEST_ID.linkToUsers}
        >
          Community
        </NavLink>
      </li>

      <li>
        <NavLink to="/favorites" className={navItemClass}>
          Favorites
        </NavLink>
      </li>

      {user && (
        <li>
          <NavLink to="/my-listings" className={navItemClass}>
            My Listings
          </NavLink>
        </li>
      )}

      {user && (
        <li>
          <NavLink to="/inbox" className={navItemClass}>
            Inbox
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </NavLink>
        </li>
      )}
    </ul>
  );
};

NavLinks.propTypes = {
  user: PropTypes.object,
  unreadCount: PropTypes.number,
};

export default NavLinks;
