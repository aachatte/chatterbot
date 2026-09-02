export default {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}
