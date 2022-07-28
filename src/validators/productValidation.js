const isValidSize = (size)=> {
   
    const validSize = size.split(",").map(x => x.toUpperCase().trim())
   
    let givenSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
  
    for (let i = 0; i < validSize.length; i++) {
      if (!givenSizes.includes(validSize[i])) {
        return false
      }
    }
    return validSize
  }


  module.exports = {isValidSize}