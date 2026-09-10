import { useState, useCallback } from "react";

export function useFormWithValidation<T extends Record<string, string>>(
  defaultValues: T,
) {
  const [values, setValues] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value } as T);
    setErrors({ ...errors, [name]: event.target.validationMessage });
    setIsValid(event.target.closest("form")!.checkValidity());
  };

  const resetForm = useCallback(
    (
      newValues = defaultValues,
      newErrors: Record<string, string> = {},
      newIsValid = false,
    ) => {
      setValues(newValues);
      setErrors(newErrors);
      setIsValid(newIsValid);
    },
    [defaultValues],
  );

  return {
    values,
    handleChange,
    errors,
    isValid,
    setIsValid,
    resetForm,
    setValues,
  };
}
