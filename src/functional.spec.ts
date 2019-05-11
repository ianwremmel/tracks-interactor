import {Context, interact, InteractorFailure} from './functional';

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
    it.todo('produces a successful context');
    it.todo('produces a failed context');
    it.todo('chains orthogonal interactors without narrowing their contexts');
  });
});
