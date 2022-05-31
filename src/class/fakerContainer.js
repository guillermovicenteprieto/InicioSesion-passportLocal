import faker from '@faker-js/faker'

function generateRandomProduct(cant = 5) {
    let listProducts = [];
    for (let i = 0; i < Number(cant); i++) {
        const prod = {
            id: i+1,
            name: faker.commerce.productName(),
            price: faker.commerce.price(),
            url: faker.internet.url()
        }
        listProducts.push(prod); 
    }
    return listProducts
}

export default generateRandomProduct;
