import {InteractorConstructor} from './interactor';
import {Context, InteractorFailure, ResultContext} from './context';

/**
 * `interact()` corresponds to the class method `Interactor.call` from ruby, but
 * since TypeScript can't use generic types from a class definition in static
 * methods, we need to do some gymnastics to keep it separate.
 *
 * @param I The interactor to invoke
 * @param context
 */

export async function interact<T, R>(
  I: InteractorConstructor<T, R>,
  context: T | Context<T>
): Promise<ResultContext<T, R>>;

/** Function for invoking an Interactor */
export async function interact<T, R>(
  I: InteractorConstructor<T, R>,
  context: T | Context<T>
) {
  const typedContext =
    context instanceof Context ? context : new Context(context);
  const i = new I();
  i.context = typedContext;
  try {
    const result = await i.call();
    return result instanceof Context ? result : new Context(result);
  } catch (err) {
    if (err instanceof InteractorFailure) {
      return {
        error: err,
        failed: true,
      };
    }
    throw err;
  }
}
