"use client";

import { useState, type ChangeEvent } from "react";

type Element = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Keeps form fields controlled. React resets uncontrolled forms after a Server Action
 * completes, which would discard user input when the server returns validation errors.
 */
export function useFormValues<K extends string>(initial: Record<K, string>) {
  const [values, setValues] = useState(initial);

  function field(name: K) {
    return {
      name,
      value: values[name],
      onChange: (e: ChangeEvent<Element>) =>
        setValues((current) => ({ ...current, [name]: e.target.value })),
    };
  }

  return { values, setValues, field };
}
