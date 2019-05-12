import {Interactor, InteractorConstructor} from './interactor';
import {Context, InteractorFailure, ResultContext} from './context';
import {TypeNarrowingError} from './lib/type-narrowing-error';

/**
 * `interact()` corresponds to the class method `Interactor.call` from ruby, but
 * since TypeScript can't use generic types from a class definition in static
 * methods, we need to do some gymnastics to keep it separate.
 *
 * @param I The interactor or organizer to invoke
 * @param context
 */

export async function interact<T, R>(
  I: InteractorConstructor<T, R>,
  context: T | Context<T>,
  returnInteractor: true
): Promise<{context: ResultContext<T, R>; interactor: Interactor<T, R>}>;

export async function interact<T, R>(
  I: InteractorConstructor<T, R>,
  context: T | Context<T>
): Promise<ResultContext<T, R>>;

/** Function for invoking an Interactor (or Organizer) */
export async function interact<T, R>(
  I: InteractorConstructor<T, R>,
  context: T | Context<T>,
  returnInteractor?: boolean
) {
  const typedContext =
    context instanceof Context ? context : new Context(context);
  const i = new I(typedContext);
  try {
    let ret: Context<R>;

    const inner = async () => {
      if (typeof i.before === 'function') {
        await i.before();
      }
      ret = await i.call();
      if (typeof i.after === 'function') {
        await i.after();
      }
    };

    if (typeof i.around === 'function') {
      await i.around(inner);
    } else {
      await inner();
    }

    // @ts-ignore - typescript thinks ret is being used before it's defined, but
    // it's not.
    if (typeof ret === 'undefined') {
      throw new TypeError(
        'Return context has not been assigned. Did you forget to invoke `fn()` in your `around()` method?'
      );
    }

    if (returnInteractor) {
      return {
        context: ret,
        interactor: i,
      };
    }

    return ret;
  } catch (err) {
    if (err instanceof InteractorFailure) {
      const typedErr = err as InteractorFailure;
      if (returnInteractor) {
        return {
          context,
          interactor: i,
        };
      }
      return {
        error: err,
        failed: true,
      };
    }
    throw err;
  }
}
