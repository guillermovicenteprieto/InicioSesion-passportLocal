import parseArgs from 'minimist'

const options = { default: {port: 8080}}

export const PORT = parseArgs(process.argv, options).port

