import styles from "./panel.module.css";

export default function Panel({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  return (
    <div className={styles.Panel} data-open={isOpen}>
      {children}
    </div>
  );
}
