import "./Icon.scss";

function Icon({ children, variant = "primary" }) {
  return <span className={`icon icon--${variant}`}>{children}</span>;
}

export default Icon;