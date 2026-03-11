import "./Button.scss";

function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}) {
  return (
    <button
      className={`button button--${variant}`}
      onClick={(e) => onClick(e)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;