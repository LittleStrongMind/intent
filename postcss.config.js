module.exports = {
    plugins: [
        require('autoprefixer')({
            browsers: ['Explorer 10']
        }),
        require('postcss-color-rgba-fallback')({})
    ]
};
