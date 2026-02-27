export default {
    testEnvironment: 'node',
    transform: {}, // Tells jest not to transpile ESM using Babel
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1' // Tell jest to ignore .js extensions in import statements since it runs in Node ESM
    },
    testMatch: [
        "**/test/**/*.test.js"
    ],
    clearMocks: true
};
