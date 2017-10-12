import "babel-polyfill";
// import "whatwg-fetch";
import {bbb} from './modules/module'

const myArray = [0, 2, 3, 5, 6];

setTimeout(() => {
  console.log(3);
}, 300);

console.log(`lol`, myArray);

const myFunc = (arr) => {
  arr.map((elem) => {
    console.log(elem);
  });
  Array.from(arr);

}

myFunc(myArray);
bbb();
