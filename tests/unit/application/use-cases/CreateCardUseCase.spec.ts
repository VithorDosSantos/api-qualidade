import { describe, expect, it, vi } from "vitest";
import { CreateCardUseCase } from "../../../../src/application/use-cases/CreateCardUseCase";
import type { UserRepository } from "../../../../src/application/ports/UserRepository";
import type { CardRepository } from "../../../../src/application/ports/CardRepository";
import type { IdGenerator } from "../../../../src/application/ports/IdGenerator";
import { User } from "../../../../src/domain/entities/User";
import { NotFoundError } from "../../../../src/shared/errors/NotFoundError";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

describe("CreateCardUseCase", () => {
  const createMockUser = () =>
    User.create({
      id: "user-1",
      name: "Alice",
      email: "alice@mail.com",
      passwordHash: "hash",
      createdAt: new Date()
    });

  const createMockRepositories = (userExists = true) => {
    const userRepository: UserRepository = {
      findById: vi.fn().mockResolvedValue(userExists ? createMockUser() : null),
      findByEmail: vi.fn(),
      save: vi.fn()
    };

    const cardRepository: CardRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn()
    };

    const idGenerator: IdGenerator = { generate: vi.fn().mockReturnValue("card-1") };

    return { userRepository, cardRepository, idGenerator };
  };

  it("should create card for existing user", async () => {
    const { userRepository, cardRepository, idGenerator } = createMockRepositories(true);
    const useCase = new CreateCardUseCase(userRepository, cardRepository, idGenerator);

    const card = await useCase.execute({
      userId: "user-1",
      cardNumber: "1234123412341234",
      limitCents: 1000
    });

    expect(card.id).toBe("card-1");
    expect(card.toJSON().last4).toBe("1234");
    expect(cardRepository.save).toHaveBeenCalledOnce();
  });

  it("should fail when user does not exist", async () => {
    const { userRepository, cardRepository, idGenerator } = createMockRepositories(false);
    const useCase = new CreateCardUseCase(userRepository, cardRepository, idGenerator);

    await expect(
      useCase.execute({
        userId: "user-1",
        cardNumber: "1234123412341234",
        limitCents: 1000
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("should fail when card number is invalid", async () => {
    const { userRepository, cardRepository, idGenerator } = createMockRepositories(true);
    const useCase = new CreateCardUseCase(userRepository, cardRepository, idGenerator);

    await expect(
      useCase.execute({
        userId: "user-1",
        cardNumber: "1234",
        limitCents: 1000
      })
    ).rejects.toThrow(ValidationError);
  });
});
