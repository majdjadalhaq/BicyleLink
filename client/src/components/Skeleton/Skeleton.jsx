import styles from "./Skeleton.module.css";

const Skeleton = ({ type }) => {
  if (type === "card") {
    return (
      <div className={styles.cardSkeleton}>
        <div className={styles.image}></div>
        <div className={styles.title}></div>
        <div className={styles.price}></div>
        <div className={styles.city}></div>
      </div>
    );
  }

  if (type === "inbox") {
    return (
      <div className={styles.inboxSkeleton}>
        <div className={styles.avatar}></div>
        <div className={styles.content}>
          <div className={styles.line}></div>
          <div className={styles.lineShort}></div>
        </div>
      </div>
    );
  }

  return <div className={styles.skeleton}></div>;
};

export default Skeleton;
