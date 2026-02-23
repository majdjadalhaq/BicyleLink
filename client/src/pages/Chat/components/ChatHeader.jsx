import PropTypes from "prop-types";
import styles from "../Chat.module.css";

const ChatHeader = ({ onBack, listing, isOnline }) => {
  let displayPrice = listing?.price;
  if (listing?.price && typeof listing.price === "object") {
    if (listing.price.$numberDecimal) {
      displayPrice = listing.price.$numberDecimal;
    } else if (listing.price.value != null) {
      displayPrice = listing.price.value;
    }
  }

  return (
    <header className={styles.chatHeader}>
      <button className={styles.backButton} onClick={onBack}>
        ←
      </button>
      <div className={styles.headerInfo}>
        <h2 className={styles.chatTitle}>
          {listing?.title || "Chat"}
          <span
            className={isOnline ? styles.onlineDot : styles.offlineDot}
          ></span>
        </h2>
        {displayPrice && (
          <span className={styles.listingPrice}>€{displayPrice}</span>
        )}
      </div>
    </header>
  );
};

ChatHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
  listing: PropTypes.object,
  isOnline: PropTypes.bool.isRequired,
};

export default ChatHeader;
