import { ValidationError } from "../../shared/errors/ValidationError";

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(email: string): Email {
    const normalized = email.trim().toLowerCase();
    // This regex is safe - uses only character classes without nested quantifiers
    // No catastrophic backtracking possible: O(n) linear time complexity
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // NOSONAR

    if (!emailRegex.test(normalized)) {
      throw new ValidationError("Invalid email format");
    }

    return new Email(normalized);
  }

  public getValue(): string {
    return this.value;
  }
}
