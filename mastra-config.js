export default {
  entry: './src/mastra/index.js',
  build: {
    outDir: '.mastra'
  },
  server: {
    port: process.env.PORT || 4040
  }
}