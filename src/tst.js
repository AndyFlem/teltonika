createIteratorsAwaitAndPrint()

async function createIteratorsAwaitAndPrint() {   

    let p1 = new Promise(function (r) {
      setTimeout(r, 3000, 1)
    })
  
    let p2 = new Promise(function (r) {
      setTimeout(r, 2000, 2)
    })
  
    let p3 = new Promise(function (r) {
      setTimeout(r, 1000, 3)
    })
  
    let arrayOfPromises = [p1, p2, p3];
  
    for await (let p of arrayOfPromises) {
      console.log(p)
    } 
    console.log('end of createIteratorsAwaitAndPrint')
  }