import React, { useState } from 'react';

interface TextInputProps {
    value: string; 
    onChange: Function;
    placeholder?: string;
    type?: 'text';
    variant?: 'primary';
}

const variantStyles: Record<string, string> = {
    primary: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
}

const TextInput: React.FC<TextInputProps> = ({
    value,
    onChange,
    placeholder = '',
    type = 'text',
    variant = 'primary',
}) => {
    return <input 
                type = {type}
                value = {value}
                placeholder = {placeholder}
                onChange = {(e) => onChange(e.target.value)}
                className = {variantStyles[variant]}
    />;
};

export default TextInput;