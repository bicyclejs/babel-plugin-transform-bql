/* global bql, myUserID */

const query = bql`
  user(id: ${myUserID}) {
    id,
    name
  }
  event(year: 2016, month: 3, day: 20) as dayOne {
    title
  }
  event(year: 2016, month: 3, day: 21) as dayTwo {
    title
  }
`;

console.log(query);
