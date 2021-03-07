# Contributing

Contributions are welcome, and they are greatly appreciated! Every
little bit helps, and credit will always be given.

You can contribute in many ways:

## Types of Contributions

### Report Bugs

Report bugs at <https://github.com/thorgate/tg-spa-utils/issues>.

If you are reporting a bug, please include:

-   Browser and version.
-   Any details about your local setup that might be helpful
    in troubleshooting.
-   Detailed steps to reproduce the bug.

### Fix Bugs

Look through the GitHub issues for bugs. Anything tagged with "help wanted" is
open to whoever wants to implement it.

### Implement Features

Look through the GitHub issues for features. Anything tagged with
"feature" is open to whoever wants to implement it.

### Write Documentation

`tg-spa-utils` packages could always use more documentation, whether as part of
`tg-spa-utils`, or even on the web in blog posts, articles and such.

### Submit Feedback

The best way to send feedback is to file an issue at
<https://github.com/thorgate/tg-spa-utils/issues>.

If you are proposing a feature:

-   Explain in detail how it would work.
-   Keep the scope as narrow as possible, to make it easier
    to implement.
-   Remember that this is a volunteer-driven project, and that
    contributions are welcome :)


### Changelog

Changelog is maintained via github releases.


## Get Started!

Ready to contribute? Here's how to set up tg-spa-utils for local
development.

1.  Fork the tg-spa-utils repo on GitHub.
2.  Clone your fork locally:

        $ git clone git@github.com:your_name_here/tg-spa-utils.git

3.  Install dependencies

        $ yarn install
        $ yarn bootstrap

4.  Create a branch for local development:

        $ git checkout -b name-of-your-bugfix-or-feature

    Now you can make your changes locally.

5.  When you're done making changes, check that your the tests and linting
    still pass.

        $ yarn test
        $ yarn lint

6.  Commit your changes and push your branch to GitHub:

        $ git add .
        $ git commit -m "Your detailed description of your changes."
        $ git push origin name-of-your-bugfix-or-feature

7.  Submit a pull request through the GitHub website.

## Pull Request Guidelines

Before you submit a pull request, check that it meets these guidelines:

1.  The pull request should include tests.
2.  If the pull request adds functionality, the docs should be updated.

## Creating a new release

Once the changes have been published on the master branch and it is time to create a new
release you can do this following these steps.

1. Make sure your `origin` git remote points to the root repository.
2. Ensure your local working directory is clean and contains the latest changes from remote:
   - `git status --porcelain && git pull origin master`
3. Log in to npm using `npm login`
4. Then use `yarn run-publish` or `yarn run-publish:git` to create a new release
   - `run-publish`: publish packages that have changed since the last release
   - `run-publish:git`: explicitly publish packages tagged in the current commit
5. Once the script completes the updated versions should be available in npm
