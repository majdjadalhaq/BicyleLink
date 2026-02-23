import PropTypes from "prop-types";
import styles from "../Chat.module.css";

const MessageItem = ({
  msg,
  user,
  onCopyUsername,
  onImageClick,
  copyFeedback,
  isAdminWarning,
}) => {
  const isSender = (msg.senderId._id || msg.senderId) === user._id;
  const senderName = msg.senderId.name || "User";

  if (isAdminWarning) {
    return (
      <div className={styles.systemWarning}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span> Administrator Warning
        </div>
        <div className={styles.warningContent}>{msg.content}</div>
        <div className={styles.timeStamp}>
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.message} ${isSender ? styles.sent : styles.received}`}
    >
      {!isSender && (
        <div
          className={styles.senderName}
          onClick={() => onCopyUsername(senderName)}
          title="Click to copy username"
        >
          {senderName}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.copyIcon}
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copyFeedback === senderName && (
            <span className={styles.copyFeedback}>Copied!</span>
          )}
        </div>
      )}

      <div className={styles.mediaContainer}>
        {msg.mediaType === "image" && msg.mediaUrl && (
          <img
            src={msg.mediaUrl}
            alt="Shared attachment"
            className={styles.messageImage}
            onClick={() => onImageClick(msg.mediaUrl)}
          />
        )}
        {msg.mediaType === "location" && msg.location && (
          <div className={styles.locationCard}>
            <img
              src={`https://static-maps.yandex.ru/1.x/?ll=${msg.location.lng},${msg.location.lat}&z=14&l=map&pt=${msg.location.lng},${msg.location.lat},pm2rdm`}
              alt="Location Preview"
              className={styles.mapPreview}
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`,
                  "_blank",
                )
              }
            />
            <div className={styles.locationInfo}>
              <p className={styles.addressText}>
                {msg.location.address || "Live Location"}
              </p>
              <div className={styles.locationActions}>
                <a
                  href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionButton}
                >
                  📍 Open Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${msg.location.lat},${msg.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionButton}
                >
                  🚗 Directions
                </a>
              </div>
            </div>
          </div>
        )}
        {msg.content &&
          msg.content !== "[Image]" &&
          !msg.content.startsWith("[Location:") && (
            <div className={styles.messageText}>{msg.content}</div>
          )}
      </div>

      <div className={styles.timeStamp}>
        {new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};

MessageItem.propTypes = {
  msg: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  onCopyUsername: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
  copyFeedback: PropTypes.string,
  isAdminWarning: PropTypes.bool,
};

export default MessageItem;
