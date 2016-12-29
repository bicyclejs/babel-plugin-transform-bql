/* global bql, myUserID */

let imageQuery = bql`
  image {
    square
    small
    large
  }
`;
const eventQuery = bql`
  date
  location
`;
const defaultLength = 10;
function getQuery(myUserID) {
  return bql`
    user(id: ${myUserID}) {
      id,
      name
      image {
        circle
      }
      ...${imageQuery}
    }
    // you can use aliases to query the same field twice
    event(year: 2016, month: 'March', day: 20) as dayOne {
      title(length: ${10})
      ...${eventQuery}
    }
    event(year: 2016, month: 'March', day: 21) as dayTwo {
      title(length: ${defaultLength})
      ...${eventQuery}
    }
  `;
}


imageQuery = bql`
  image {
    square
    small
  }
`;


module.exports = getQuery(10);
