module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glsl|frag|vert)$/,
      use: [
        "raw-loader"
      ]
    })
    return config
  }
}
