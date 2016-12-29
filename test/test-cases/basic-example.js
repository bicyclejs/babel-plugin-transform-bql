/* global bql, myUserID */

const imageQuery = bql`
  square
  small
  large
`;
const query = bql`
  user(id: ${myUserID}) {
    id,
    name
    image {
      ...${imageQuery}
    }
  }
  event(year: 2016, month: 'March', day: 20) as dayOne {
    title
  }
  event(year: 2016, month: 'March', day: 21) as dayTwo {
    title
  }
`;

console.log(query);
