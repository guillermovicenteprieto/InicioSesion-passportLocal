const arrNum = []
const cantidad = Number(process.argv[2])

function getRandomNumbers(cantidad) {
    const min = 1 ;
    const max = 1000; 
    
    for (let i = 0; i < cantidad; i++) {
        const numero =  Math.floor(Math.random() * (max - min) + min)
        arrNum.push(numero)
    }
}

process.send(getRandomNumbers(cantidad))