import useRealNotifications from "../hooks/useRealNotifications";

function NotificationsDropdown({ user }) {
  const { items, unread, markAsRead } = useRealNotifications(user);

  return (
    <div>
      <h3>Unread: {unread}</h3>
      <ul>
        {items.map((n) => (
          <li key={n._id}>
            <strong>{n.title}</strong>: {n.body}
            {!n.read && (
              <button onClick={() => markAsRead(n._id)}>Mark as read</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationsDropdown;
