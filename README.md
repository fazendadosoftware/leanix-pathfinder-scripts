leanix-pathfinder-scripts
========================

Project template for implementing, running and debugging LeanIX GraphQL tasks
as unit tests, or more advanced UI tasks as E2E tests, based on Typescript, Jest and Playwright

Requirements
------------

leanix-pathfinder-scripts requires the following to run:

  * [Node.js][node] v18.4.0+
  * [npm][npm] (normally comes with Node.js)
  * [Visual Studio Code][vscode]
  * Recommended Visual Studio Code extensions:
    * [Typescript][typescript-extension]
    * [Jest][jest-extension]
    * [Plawright][jest-extension]
    * [Eslint][eslint-extension]
    * [GraphQL][graphql-extension]

## Installation

```bash
git clone git@github.com:fazendadosoftware/leanix-pathfinder-scripts.git
cd leanix-pathfinder-scripts
npm install
```

## Usage
1. Add a ".env" file to the project root folder with the following content:

        LEANIX_HOST=your workspace host here, e.g. us.leanix.net
        LEANIX_APITOKEN=your api token here

2. Open the ```__tests__``` folder and inspect the different tests located inside ```unit``` and ```e2e``` sub-folders. If you have the [Jest][jest-extension] and [Playwright][playwright-extension] Visual Studio Code extensions installed, you can run or debug each test individually.

[node]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[vscode]: https://code.visualstudio.com/
[typescript-extension]: https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next
[jest-extension]: https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest
[playwright-extension]: https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright
[eslint-extension]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[graphql-extension]: https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql
