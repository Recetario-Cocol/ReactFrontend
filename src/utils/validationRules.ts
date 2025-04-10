export const passwordValidationRules = {
    required: 'La contraseña es obligatoria',
    pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        message: 'La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número',
    },
};

export const confirmPasswordValidation = (password: string) => ({
    required: 'La confirmación de la contraseña es obligatoria',
    validate: (value: string) => value === password || 'Las contraseñas no coinciden',
});
