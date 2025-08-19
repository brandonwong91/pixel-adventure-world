import React from "react";

interface ActionButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  text,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left p-4 bg-gray-800 text-green-400 border-2 border-gray-700 hover:bg-gray-700 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
    >
      {text}
    </button>
  );
};

export default ActionButton;
