// src/components/Button.jsx
function Button({ children, variant = "primary", className = "", ...props }) {
    const styles = {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };
    return (
      <button
        className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 
                    disabled:cursor-not-allowed transition ${styles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
export default Button;