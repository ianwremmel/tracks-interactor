# tracks-interactor _(@ianwremmel/tracks-interactor)_

<!-- (optional) Put banner here -->

<!-- PROJ: Badges Start -->

[![license](https://img.shields.io/github/license/ianwremmel/tracks-interactor.svg)](https://github.com/ianwremmel/tracks-interactor/blob/master/LICENSE)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![npm (scoped)](https://img.shields.io/npm/v/@ianwremmel/tracks-interactor.svg)](https://www.npmjs.com/package/@ianwremmel/tracks-interactor)
[![npm](https://img.shields.io/npm/dm/@ianwremmel/tracks-interactor.svg)](https://www.npmjs.com/package/@ianwremmel/tracks-interactor)

[![Dependabot badge](https://img.shields.io/badge/Dependabot-active-brightgreen.svg)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![CircleCI](https://circleci.com/gh/ianwremmel/tracks-interactor.svg?style=svg)](https://circleci.com/gh/ianwremmel/tracks-interactor)

<!-- PROJ: Badges End -->

> Codify your business logic

Inspired by the [Interactor](https://github.com/collectiveidea/interactor) gem,
this library provides a pattern for encapselating business logic into small,
testable units.

## Table of Contents

<!-- toc -->

-   [Install](#install)
-   [Differences from the Interactor Gem](#differences-from-the-interactor-gem)
-   [Breaking Changes](#breaking-changes)
-   [Maintainer](#maintainer)
-   [Contribute](#contribute)
-   [License](#license)

<!-- tocstop -->

## Install

```bash
npm install @ianwremmel/tracks-interactor
```

Define your interactor. You'll need to tell it about the shapes of the data it
will accept and produce. Then, you'll need to define `call`, which does the
interactor's work. `call` accepts a `Context<T>` and returns a `Context<R>`. (In
the following example, `T` is `AuthToken` and `R` is `Model<User>`).

```ts
import {Interactor} from 'interactor';

type AuthToken = string;
type User = Model<User>;

class Authorize extends Interactor<AuthToken, User> {
    call() {
        const user = await User.findByToken(this.context.data);
        if (!user) {
            this.context.fail('could not find user for specified token');
        }
        return user;
    }
}
```

Then, use `interact` to invoke your Interactor (e.g., in an express route).

```js
import {Authorize} from './interactors/authorize';
import {interact} from 'interactor';
import express from 'express';

const router = express.Router();

router.use(async (req, res, next) => {
    const context = await interact(
        Authorize,
        new Context(req.headers.authorization)
    );

    if (context.failure) {
        next(401);
    }
});

router.get('/account', (req, res) => {
    res.render('account');
});
```

## Differences from the Interactor Gem

-   The gem invokes a given Interactor via its static `call` method. TypeScript
    doesn't make type arguments visible to static methods, so we use the bare
    method `interact` as a stand-in for `Interactor.call()`.
-   `after`, `before`, and `around` may not alter their context (they may fail
    the context, though that should be avoided in `after` and `around`).
-   Organizers don't exist. A previous version of this library included them,
    but having not used that portion of the library for over a year, they're
    continued maintencance didn't seem worth it.

## Breaking Changes

-   A previous version of this package expected a `services` object to be passed
    to `interact`. You should just put your services on the context.

    Instead of

    ```ts
    interact(services, MyInteractor, {...args});
    ```

    do

    ```ts
    interact(MyInteractor, {services, ...args});
    ```

## Maintainer

[Ian Remmel](https://github.com/ianwremmel)

## Contribute

PRs Welcome

## License

[MIT](LICENSE) &copy; [Ian Remmel](https://github.com/ianwremmel) 2019 until at
least now
