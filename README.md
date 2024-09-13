## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## App architecture
The project follows a clean and modular architecture to ensure scalability and maintainability. Below is the structure of the src folder:
```
src/
│
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
│
├── config/
│   ├── swagger.config.ts
│   └── app.config.ts
│
├── modules/
│   ├── module1/
│   │   ├── dto/
│   │   ├── interfaces/
│   │   ├── schemas/
│   │   ├── module1.controller.ts
│   │   ├── module1.service.ts
│   │   ├── module1.module.ts
│   │   └── module1.repository.ts
│   │
│   ├── module2/
│   │   ├── dto/
│   │   ├── interfaces/
│   │   ├── schemas/
│   │   ├── module2.controller.ts
│   │   ├── module2.service.ts
│   │   ├── module2.module.ts
│   │   └── module2.repository.ts
│   │
│   └── .../
│
├── shared/
│   ├── constants/
│   ├── middlewares/
│   └── services/
│
└── environment/
│   ├── development.env
│   ├── production.env
│   └── test.env
│
├── app.module.ts
├── main.ts


