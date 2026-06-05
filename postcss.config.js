module.exports = ({ env }) => ({
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(env === 'production' ? { cssnano: { preset: 'default' } } : {}),
  },
});
