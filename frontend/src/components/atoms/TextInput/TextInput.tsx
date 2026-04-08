import React, { useState } from 'react';

interface TextInputProps {
    value: string; 
    onChange: Function;
    placeholder?: string;
    type?: 'text';
    variant?: 'primary';
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
                className = {`text-input text-input--${variant}`}
    />;
};

export default TextInput;