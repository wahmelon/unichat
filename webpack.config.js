const path = require('path');

module.exports = {
    mode: "development",
    entry: path.resolve(__dirname, 'unichat/frontend/src/index.js'),
    output: {
        // options related to how webpack emits results

        // where compiled files go
        path: path.resolve(__dirname, "unichat/frontend/static/frontend/public/"),

        // 127.0.0.1/static/frontend/public/ where files are served from
        publicPath: "/static/frontend/public/",
        filename: 'main.js',  // the same one we import in index.html
    },

    module: {
        // configuration regarding modules
        rules: [
            {
                // regex test for js and jsx files
                test: /\.(js|jsx)?$/,
                // don't look in the node_modules/ folder
                exclude: /node_modules/,
                // for matching files, use the babel-loader
                use: {
                    loader: "babel-loader",
                    options: {presets: ["@babel/env"]}
                },
            },

            {test: /\.(png|jpe?g|gif)$/i, use: [{loader: 'file-loader'}]},
            {test:/\.css$/, use:['style-loader','css-loader']},
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                      name: '[name].[ext]',
                      outputPath: 'fonts/'
                    }
                  }
                ]
              }
        ]
    },
};

//https://hackernoon.com/110percent-complete-jwt-authentication-with-django-and-react-2020-iejq34ta