function randomNumbers(cant) {
    const numeros = []
    const min = 1;
    const max = 1000;
    for (let i = 0; i < cant; i++) {
      const numbers = { numbers: Math.floor(Math.random() * (max - min) + min) }
      numeros.push(numbers)
    }
    return numeros
  }
  
  process.on('message', (passCant) => {
    if (passCant.length > 0) {
      process.send(randomNumbers(passCant));
    }
  });