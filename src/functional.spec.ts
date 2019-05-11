import {Context, interact, InteractorFailure, organize} from './functional';

type ServiceMap = Record<string, any>;
const services: ServiceMap = {};

describe('Functional Interactors', () => {
  describe('single interactor', () => {
    it('produces a successful context from literals', async () => {
      const interactor = async (ctx: Context<ServiceMap, {}>) =>
        new Context(services, {
          proof: true,
        });

      const result = await interact(interactor, services, {});
      if (result.failed) {
        expect(result.failed).toBe(false);
      } else {
        expect(result.data).toHaveProperty('proof');
        expect(result.data.proof).toBe(true);
      }
    });

    it('produces a failed context', async () => {
      const interactor = async (ctx: Context<ServiceMap, {}>) => {
        ctx.fail(new Error('it done broke'));

        return new Context(services, {
          proof: true,
        });
      };

      const result = await interact(interactor, services, {});

      if (result.failed) {
        expect(result.data).not.toHaveProperty('proof');
        expect(result.error).toBeInstanceOf(InteractorFailure);
        expect(result.error.message).toMatch(/it done broke/);
      } else {
        expect(result.failed).toBe(true);
      }
    });
  });

  describe('chained interactors', () => {
    it('produces a successful context', async () => {
      interface AInput {
        a: boolean;
      }
      interface BInput {
        b: boolean;
      }
      interface CInput {
        c: boolean;
      }
      const a = async (ctx: Context<ServiceMap, AInput>) => {
        return new Context(services, {
          b: true,
        });
      };

      const b = async (ctx: Context<ServiceMap, BInput>) => {
        return new Context(services, {
          c: true,
        });
      };

      const c = async (ctx: Context<ServiceMap, CInput>) => {
        return new Context(services, {
          d: true,
        });
      };

      const result = await interact(
        organize(a)
          .organize(b)
          .organize(c),
        services,
        {a: true}
      );

      if (result.failed) {
        expect(result.failed).toBe(false);
      } else {
        expect(result.data).toHaveProperty('d');
        expect(result.data.d).toBe(true);
      }
    });
    it.todo('produces a failed context');
    it.todo('chains orthogonal interactors without narrowing their contexts');
  });
});
