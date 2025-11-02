/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveClass(className: string): R
    toHaveStyle(style: string | object): R
    toHaveAttribute(attribute: string, value?: string): R
    toHaveValue(value: string | number): R
  }
}
