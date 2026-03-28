import { screen } from "@testing-library/react";

/**
 * Asserts that form validation blocked submission.
 * Waits for at least one role="alert" to appear, then verifies onSubmit was NOT called.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export async function expectValidationBlocked(onSubmit: Function): Promise<void> {
  await screen.findAllByRole("alert");
  expect(onSubmit).not.toHaveBeenCalled();
}

/**
 * Asserts that validation produced a specific error message.
 */
export async function expectValidationMessage(message: string): Promise<void> {
  const alerts = await screen.findAllByRole("alert");
  const messages = alerts.map((el) => el.textContent);
  expect(messages).toContain(message);
}
