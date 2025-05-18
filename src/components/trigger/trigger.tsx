import styles from "./trigger.module.css";

export default function Trigger({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <button className={styles.Trigger} onClick={() => setIsOpen(!isOpen)}>
      O
    </button>
  );
}
