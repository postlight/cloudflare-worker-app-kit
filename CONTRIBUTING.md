# Contributing to Cloudflare Worker App Kit

Thank you for your interest in contributing to Cloudflare Worker App Kit! It's people like you that make this set of tools better for everyone. The below guidelines will help answer any questions you may have about the contribution process. We look forward to receiving contributions from you — our community!

_Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before participating._

## Ways to Contribute

There are many ways you can contribute. Here are a couples examples of what we consider a contribution:

- Updates to source code, including bug fixes, improvements, or creating new features
- Filing, organizing, and commenting on issues in the [issue tracker](https://github.com/postlight/cloudflare-worker-app-kit/issues)
- Improving documentation

## Reporting a Bug

While bugs are unfortunate, they're a reality in software. We can't fix what we don't know about, so please report liberally. If you're not sure if something is a bug or not, feel free to file a bug anyway.

If you have the chance, before reporting a bug, please search existing issues, as it's possible that someone else has already reported the error. This doesn't always work, and sometimes it's hard to know what to search for, so consider this extra credit. We won't mind if you accidentally file a duplicate report.

Opening an issue is as easy as following [this link](https://github.com/postlight/cloudflare-worker-app-kit/issues/new)
and filling out the template.

### Security

If you find a security bug in Lorem Ipsum Generator Generator, send an email with a descriptive subject line
to [hello+labs@postlight.com](mailto:hello+labs@postlight.com). If you think you’ve found a serious vulnerability, please do not file a public issue.

Your report will go to Postlight's core development team. You will receive acknowledgement of the report in 24-48 hours, and our next steps should be to release a fix.

A working list of public, known security-related issues can be found in the
[issue tracker](https://github.com/postlight/lorem-ipsum-generator-generator/issues?q=is%3Aopen+is%3Aissue+label%3Asecurity).

## Requesting a Feature

To request a change to the way this app kit works, please open an issue in this repository named, "Feature Request: [Your Feature Idea]," followed by your suggestion.

## Submitting a Pull Request

Want to make a change? Submit a pull request! We use the "fork and pull" model [described here](https://help.github.com/articles/creating-a-pull-request-from-a-fork).

### Commit Style

Commit messages should follow the format outlined below:

`prefix: message in present tense`

|   Prefix | Description                                                              |
| -------: | :----------------------------------------------------------------------- |
|    chore | does not effect the production version of the app in any way.            |
|     deps | add, update, or remove a dependency.                                     |
|      doc | add, update, or remove documentation. no code changes.                   |
|       dx | improve the development experience.                                      |
|     feat | a feature or enhancement. can be incredibly small.                       |
|      fix | a bug fix for something that was broken.                                 |
|     perf | add, update, or fix a test.                                              |
| refactor | change code, but not functionality.                                      |
|    style | change code style, like removing whitespace. no functional code changes. |
|     test | add, update, or fix a test.                                              |

### Code Reviews

Once you have submitted a pull request, a member of the core team must review it before it is merged. We try to review pull requests within 3 days but sometimes fall behind. Feel free to reach out to the core team if you have not received a review after 3 days.

_Adapted from [Contributing to Node.js](https://github.com/nodejs/node/blob/master/CONTRIBUTING.md)
and [ThinkUp Security and Data Privacy](http://thinkup.readthedocs.io/en/latest/install/security.html#thinkup-security-and-data-privacy)._
