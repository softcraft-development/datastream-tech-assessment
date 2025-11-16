# DataStream Technical Assessment for Craig Walker

As requested, I've built a SvelteKit-based app for processing CSVs and calculating water temperature.

## Guiding Implementation Principles

Technical assessments end up being a mix of conflicting interests.
I've chosen a certain balance of these:

1. YAGNI & KISS: In general, don't add features that are not required.
  * But also, go the extra mile when it's useful for the following reasons.
2. UX: Demonstrate an understanding of what helps the user achieve their goal.
  * For example: validation messages on bad input CSVs.
3. Reliability: Be sure to address some of the more major problems that could occur.
4. Testing: Demonstrate how we can _prove_ that the system operates like we're claiming.
5. Svelte Learning: Demonstrate the ability to learn a new tech on-the-fly, and adapt accordingly.
6. Performance / Scalability: give a nod towards some areas that could be slow.
7. Flexibility: Explain how & where we could evolve the code to provide more/different capabilities and tradeoffs.
8. Communication: Explain why things are done the way they're done.
  * Shows my thought process.

## AI Usage
I used ChatGPT (GPT 5.1 Instant) significantly when learning Svelte and SvelteKit.
It was often helpful... but often wrong (as we should expect).
I believe I've arrived at a basic understanding that is mostly correct,
but there's certainly room for additional learning, discussion, and improvement.

Almost all of the non-Svelte code is written by me personally,
with occasional AI-generated code for ideation & bug fixing.
SvelteKit auto-generated a lot of the initial boilerplate; see the first commit.

## Testing Techniques
Note that my tests/specs make heavy use of `memo`.
This allows all of my test setup to be:
  * Dynamically derived from other test state.
  * Modified at any point in the test, independent of the order of declaration.
  * Lazily created.

This gives me a lot of power to iteratively expand and evolve test scenarios,
from more generalized to more specific,
and thus write a very large number of test cases while keeping them relatively manageable.
This is similar in principle to [Behaviour Driven Development (BDD)](https://en.wikipedia.org/wiki/Behavior-driven_development) principles for testing
(without requiring a specific DSL like Cucumber).

I first learned these patterns when using [RSpec](https://rspec.info/) for Ruby on Rails tests.
I've ported the patterns to most of the languages & platforms I've used ever since.
I've found the pattern to be unfamiliar to most non-Ruby devs,
and thus requires some additional education about the how & why of writing tests this way.
For me, the tradeoff in testing capability is generally worth the effort.

See also [Better Specs](https://www.betterspecs.org/).