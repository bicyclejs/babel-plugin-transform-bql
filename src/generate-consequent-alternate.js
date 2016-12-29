/* eslint no-undef: 0, no-unused-vars: 0, new-cap: 0 */

function GENERATE_CONSEQUENT_ALTERNATE(base, consequent, alternate) {
  return {
    consequent: MERGE_QUERIES(base, consequent),
    alternate: alternate ? MERGE_QUERIES(base, alternate) : base,
  };
}
